import CitizenPortalWrapper from "@/components/citizen/citizen-portal-wrapper";
import BulletinBoard from "@/components/civic/bulletin-board";

export const metadata = {
  title: 'Citizen Portal | SEVAK',
  description: 'Report and track local issues in your city.',
};

export default function CitizenPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold font-serif text-xl">
              C
            </div>
            <span className="font-serif font-bold text-xl tracking-tight text-primary">SEVAK</span>
          </div>
        </div>
      </header>

      <main>
        <div className="text-center py-12 px-6">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-4">
            Report an Issue.
          </h1>
          <p className="font-sans text-muted-foreground text-lg max-w-2xl mx-auto">
            Help us make the city better. Track your reports and see nearby issues.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-6 mb-8 mt-4">
          <BulletinBoard />
        </div>

        <CitizenPortalWrapper />
      </main>
    </div>
  );
}
