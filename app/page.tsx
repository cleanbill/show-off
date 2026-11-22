import ImageClockDisplay from "./components/ImageClockDisplay";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-950">
      <ImageClockDisplay />
    </main>
  );
}