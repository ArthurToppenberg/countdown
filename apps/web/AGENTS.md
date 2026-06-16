<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Fail fast — læs før du koder React eller e-mail

Før du skriver eller ændrer React-komponenter, React Email-skabeloner eller e-mail-afsendelse: læs [`LLM-FAIL-FAST.md`](./LLM-FAIL-FAST.md).

Før du rører databasen: læs [`packages/db/README.md`](../../packages/db/README.md).

Kort version: ingen fallbacks for påkrævede props (`name`, `eventName`, osv.). Validér ved send/action-grænsen og kast en fejl — lad ikke skabelonen producere en "nødversion" uden navn.
