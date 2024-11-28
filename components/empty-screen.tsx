export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-lg font-semibold">
          Welcome to the Conrad Labs AI Chatbot!
        </h1>
        <p className="leading-normal text-muted-foreground">
          At Conrad Labs, we specialize in building cutting-edge, user-focused
          software solutions. With a passion for innovation, we help businesses
          create powerful digital experiences that are scalable and efficient.
        </p>
      </div>
    </div>
  )
}
