import Link from "next/link";

import { Button } from "@countdown/ui/components/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@countdown/ui/components/card";

export default function GameUnavailablePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Ingen games lige nu</CardTitle>
          <CardDescription>
            Der er ingen aktive games i øjeblikket. Kom tilbage senere – vi
            skruer op for sjoven snart.
          </CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <Link href="/">
            <Button className="w-full" variant="outline">
              Tilbage til forsiden
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
