import Link from 'next/link';

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          NVIDIA NIM Chatbot
        </h1>
        <p className="text-muted-foreground max-w-md">
          A Grok-inspired AI chatbot powered by NVIDIA NIM with Bring Your Own Key (BYOK)
        </p>
        <Link
          href="/nim-chat"
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Launch Chat →
        </Link>
      </div>
    </div>
  );
}
