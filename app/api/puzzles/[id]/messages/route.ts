import { NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase";

type Context = { params: Promise<{ id: string }> };

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function toIso(value: unknown) {
  const stamp = value as { toDate?: () => Date } | undefined;
  return stamp?.toDate?.().toISOString() ?? new Date().toISOString();
}

export async function GET(request: Request, { params }: Context) {
  const { id } = await params;
  const since = new URL(request.url).searchParams.get("since");

  try {
    let query = db()
      .collection("puzzles")
      .doc(id)
      .collection("messages")
      .orderBy("createdAt", "asc");

    if (since) {
      const date = new Date(since);
      if (!Number.isNaN(date.getTime())) {
        query = query.where("createdAt", ">", Timestamp.fromDate(date));
      }
    }

    const snapshot = await query.limit(200).get();
    const messages = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        author: data.author,
        body: data.body,
        createdAt: toIso(data.createdAt),
      };
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Loading messages failed:", error);
    return fail("Messages could not be loaded.", 500);
  }
}

export async function POST(request: Request, { params }: Context) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!body) return fail("Something went wrong with that request.");

  const author = String(body.author ?? "").trim();
  const text = String(body.body ?? "").trim();

  if (author.length < 2 || author.length > 30) {
    return fail("Add your display name first.");
  }
  if (text.length < 1 || text.length > 500) {
    return fail("Write a note between 1 and 500 characters.");
  }

  try {
    const firestore = db();
    const puzzleRef = firestore.collection("puzzles").doc(id);
    const puzzle = await puzzleRef.get();
    if (!puzzle.exists) return fail("That puzzle could not be found.", 404);

    const messageRef = puzzleRef.collection("messages").doc();
    const batch = firestore.batch();
    batch.set(messageRef, {
      author,
      body: text,
      createdAt: FieldValue.serverTimestamp(),
    });
    batch.update(puzzleRef, { messageCount: FieldValue.increment(1) });
    await batch.commit();

    const saved = await messageRef.get();

    return NextResponse.json(
      {
        message: {
          id: messageRef.id,
          author,
          body: text,
          createdAt: toIso(saved.data()?.createdAt),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Sending the message failed:", error);
    return fail("That note could not be sent.", 500);
  }
}