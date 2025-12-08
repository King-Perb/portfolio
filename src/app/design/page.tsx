
export default function DesignPage() {
  return (
    <div className="container py-10 space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Design System</h1>
        <p className="text-muted-foreground">The technical brand book for the portfolio.</p>
      </div>

      {/* Colors */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorCard name="Background" className="bg-background border" />
          <ColorCard name="Foreground" className="bg-foreground text-background" />
          <ColorCard name="Card" className="bg-card border" />
          <ColorCard name="Popover" className="bg-popover border" />
          <ColorCard name="Primary" className="bg-primary text-primary-foreground" />
          <ColorCard name="Secondary" className="bg-secondary text-secondary-foreground" />
          <ColorCard name="Muted" className="bg-muted text-muted-foreground" />
          <ColorCard name="Accent" className="bg-accent text-accent-foreground" />
          <ColorCard name="Destructive" className="bg-destructive text-destructive-foreground" />
          <ColorCard name="Border" className="bg-border" />
          <ColorCard name="Input" className="bg-input" />
          <ColorCard name="Ring" className="bg-ring" />
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Typography</h2>
        <div className="space-y-4 border p-6 rounded-lg">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Heading 1: The quick brown fox
          </h1>
          <h2 className="text-3xl font-semibold tracking-tight first:mt-0">
            Heading 2: Jumps over the lazy dog
          </h2>
          <h3 className="text-2xl font-semibold tracking-tight">
            Heading 3: Sphinx of black quartz, judge my vow
          </h3>
          <h4 className="text-xl font-semibold tracking-tight">
            Heading 4: Pack my box with five dozen liquor jugs
          </h4>
          <p className="leading-7 [&:not(:first-child)]:mt-6">
            Paragraph: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <blockquote className="mt-6 border-l-2 pl-6 italic">
            "Blockquote: The best way to predict the future is to create it."
          </blockquote>
        </div>
      </section>

      {/* Components Preview */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Components (Preview)</h2>
        <div className="flex gap-4">
           {/* We will add real buttons here once installed, for now just HTML */}
           <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
             Primary Button
           </button>
           <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80">
             Secondary Button
           </button>
           <button className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium">
             Outline Button
           </button>
           <button className="px-4 py-2 hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium">
             Ghost Button
           </button>
        </div>
      </section>
    </div>
  )
}

function ColorCard({ name, className }: { name: string; className: string }) {
  return (
    <div className={`h-24 rounded-lg flex items-center justify-center text-sm font-medium ${className}`}>
      {name}
    </div>
  )
}
