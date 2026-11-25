export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-[420px] rounded-[2rem] bg-sand" />
      <div className="mt-10 h-8 w-72 rounded-full bg-sand" />
      <div className="mt-6 space-y-4">
        <div className="h-28 rounded-3xl bg-sand/70" />
        <div className="h-28 rounded-3xl bg-sand/70" />
        <div className="h-28 rounded-3xl bg-sand/70" />
      </div>
    </div>
  );
}