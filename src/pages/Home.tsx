import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plane, Camera, Database, BarChart3, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-4">
            <Plane className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Your Personal <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
              Aviation Logbook
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Spotter's Journal is the ultimate tool for aviation enthusiasts.
            Track every sighting, manage your fleet, and visualize your spotting
            history with beautiful simplicity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="text-lg px-8 h-12" asChild>
              <Link to="/signup">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 h-12"
              asChild
            >
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30 border-t border-border/50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Camera className="w-10 h-10 text-blue-500" />}
            title="Log Sightings"
            description="Upload your high-res photos. We automatically extract EXIF data like date, time, and camera settings so you don't have to."
          />
          <FeatureCard
            icon={<Database className="w-10 h-10 text-indigo-500" />}
            title="Smart Database"
            description="Our system tracks registration history, so you know exactly which airframe you saw, even if it changed airlines or tail numbers."
          />
          <FeatureCard
            icon={<BarChart3 className="w-10 h-10 text-purple-500" />}
            title="Visualize History"
            description="See your spotting stats at a glance. Track most seen aircraft, favorite airports, and your growth over time."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-muted-foreground text-sm border-t border-border/50">
        <p>© {new Date().getFullYear()} Spotter's Journal. Built for aviators.</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-background border border-border p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="mb-4 p-3 bg-muted/50 rounded-lg w-fit">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
