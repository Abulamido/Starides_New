import Link from "next/link";
import { StaridesLogo } from "./starides-logo";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between sm:flex-row">
           <div className="flex items-center space-x-2">
            <StaridesLogo className="h-6 w-auto text-primary" />
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Starides. All rights reserved.
            </p>
          </div>
          <div className="mt-4 flex space-x-4 sm:mt-0">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
