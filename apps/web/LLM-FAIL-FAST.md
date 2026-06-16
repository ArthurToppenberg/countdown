# Fail fast — ingen meningsløse fallbacks

Denne guide er til LLM-agenter der koder i `apps/web`. Læs den før du skriver eller ændrer React-komponenter, React Email-skabeloner eller e-mail-afsendelse.

## Princip

**Manglende data er en fejl, ikke noget UI'en skal skjule.**

Hvis en bruger mangler navn, skal vi ikke sende en mail med "Hej" eller "Nååår, er du klar...". Vi skal stoppe og kaste en fejl — så fejlen bliver synlig i admin, i logs og i tests.

Fallbacks (`??`, `||`, ternaries med alternative tekster) er til *valgfri* data. De er ikke til forretningskritiske felter som navn, e-mail, event-navn eller countdown.

## Gør ikke dette

```tsx
// ❌ Nullable prop + to versioner af samme tekst
type DagligEmailProps = {
  name: string | null;
};

export const getDagligEmailBody = (name: string | null): string =>
  name
    ? `Nååår ${name} er du klar til et minigame.`
    : "Nååår, er du klar til et minigame.";

// ❌ Komponenten "redder" manglende data
{props.name ? (
  <Text>Nååår <span>{props.name}</span> er du klar...</Text>
) : (
  <Text>{body}</Text>
)}
```

```ts
// ❌ Generisk hilsen der skjuler manglende navn
export const formatEmailGreeting = (name: string | null): string =>
  name ? `Hej ${name}` : "Hej";
```

```ts
// ❌ Send-funktion der accepterer null og lader skabelonen håndtere det
export type DagligEmailInput = {
  to: string;
  name: string | null;
};
```

## Gør i stedet dette

**1. Kræv data i typerne**

```ts
type DagligEmailProps = {
  name: string; // ikke string | null
  eventName: string;
  daysRemainingLabel: string;
};
```

**2. Validér ved grænsen — før render og send**

```ts
const requireUserName = (name: string | null): string => {
  if (!name?.trim()) {
    throw new Error("Bruger mangler navn — kan ikke sende daglig e-mail");
  }
  return name.trim();
};

export const sendDagligEmail = async (input: DagligEmailInput): Promise<void> => {
  const name = requireUserName(input.name);
  const props = await buildDagligEmailProps(name);
  // ...
};
```

**3. Brug `requireUserName()`**

```ts
import { requireUserName } from "@/lib/email/require-user-name";

const name = requireUserName(
  input.name,
  "Bruger mangler navn — kan ikke sende daglig e-mail",
);
```

**4. Lad præsentationskomponenter være simple**

React-komponenter og React Email-skabeloner antager gyldige props. Ingen `if (!name)`, ingen `?? "—"`, ingen alternative copy-tekster for det samme indhold.

```tsx
// ✅ Én vej — props er garanteret gyldige
export const DagligEmail = ({ name, eventName, daysRemainingLabel }: DagligEmailProps) => (
  <Text>
    Nååår <span>{name}</span> er du klar til et minigame.
  </Text>
);
```

**5. Blokér handlingen i UI, hvis data mangler**

I admin-lister må du gerne vise at navn mangler (`"—"` i en tabelcelle er OK som *visning*). Men send-knappen skal være disabled, og server action skal stadig validere og fejle hvis nogen kalder den alligevel.

```tsx
<Button disabled={!canSendEmail || !user.name || isSending}>
  Send daglig mail
</Button>
```

## Hvor validering hører hjemme

| Lag | Ansvar |
|-----|--------|
| Server actions / API routes | Validér input, kast `Error` med dansk fejlbesked |
| `lib/email/*` send-funktioner | Validér før `sendReactEmail` / `render` |
| React Email-skabeloner (`emails/`) | Antag gyldige props — ingen fallbacks |
| React UI-komponenter | Antag gyldige props fra parent; disable knapper for ugyldig state |
| Database-lag | `name` kan være `null` i DB — konverter til fejl ved *brug*, ikke ved *visning* af rå data |

## Hvornår fallbacks er OK

- **Søgning/filter**: `(user.name ?? "").toLowerCase()` i en søgefunktion
- **Formularer**: tom streng som startværdi når brugeren skal udfylde feltet
- **Ægte valgfrie felter**: `description ?? ""` på et event der må være tomt
- **Loading/empty states**: "Ingen brugere endnu" når listen faktisk er tom
- **Auth/session UI**: valgfri hilsen på forsiden er et produktvalg — men ikke i transaktionelle mails

## React Email specifikt

- Props-typer beskriver den mail der *sendes*, ikke den rå database-række
- `render()` og `sendReactEmail()` kaldes kun efter validering
- Ingen `defaultProps`, ingen `name = "ven"`, ingen `preview`-tekst der afviger fra den rigtige mail
- Hvis én prop mangler, skal build/send fejle — ikke skabelonen producere en "nødversion"

## Kort checklist

- [ ] Er feltet påkrævet for handlingen? → `string`, ikke `string | null`
- [ ] Validerer send-funktionen før render?
- [ ] Har komponenten kun én code path for copy-teksten?
- [ ] Viser UI'en fejlen (disabled knap + error fra server action)?
- [ ] Er der *ingen* `?? ""`, `|| "—"`, eller ternary-fallback i e-mail-skabeloner?
