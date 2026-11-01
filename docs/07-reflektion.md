# Reflektion

*Inlämningsuppgift 1 – Integrera shoppen med omvärlden *

## 1. Integrationsmodell

ReLoved använder flera integrationsmodeller, och valet beror på hur datan rör sig mellan butiken och tjänsten.

- **Fil (CSV och XML)** för leverantörens produktkatalog. En katalog levereras som en helhet och läses in då och då. Importen gör upsert på artikelnumret, så att samma katalog kan importeras flera gånger utan att produkterna dupliceras.

- **REST** för leverantörs API:et, Frankfurter (valutakurser) och PostNord (ombud och leveranstid). Det är enkla fråfor som "Vilka ombud finns nära 41101?", där servern frågar när den behöver svaret.

- **SDK** för Algolia, Stripe och Supabase Storage. SDK:n bygger REST, men sköter autentisering och format åt oss.

- **Redirect och webhook** för Stripe. Kunden skickas till Stripes egen betalsida och tillbaka igen. Själva bekräftelsen kommer som en signerad webhook direkt från Stripe till servern. Detta är nödvändigt, eftersom kudnen kan stänga fliken efter betalningen och webhooken kan komma före eller efter att kunden har kommit tillbaka. Därför är det bara webhooken som får göra en order betald. 

Algolia var den integrationen som kändes mest annorlunda. Jag är van vid att sökningen kodas i själva appen, men här skickas produkterna till en extern tjänst som håller ett eget index. Databasen är fortfarande "sannaningen", och Algolia är en kopia som måste hållas i takt med den. 

## 2. Varför via Express och inte direkt från React

Allt som körs i React körs i kundens webbläsare, och där kan vem som helst öppna DevTools och se koden, nätverksanropen och alla nycklar. Om React anropade Stripe, Algolia eller PostNord direkt skulle de hemliga nycklarna behöva finnas i webbläsaren. Med Stripes nyckel skulle vem som helst kunna skapa betalningar eller återbetalningar i butikens namn. 

DEt handlar också om att kunna lita på datan. Om React räknade ut priset och frakten skulle en kund kunna ändra dem innan beställningen skickas. I ReLoved skickar React bara vilka produkter kunden köper och vilket fraktalternativ och ombud kunden har valt. Servern hämtar priserna från databasen, räknar ut frakten och frågar PostNord igen om ombudet verkligen finns för postnumret. Express blir dessutom ett enda ställe för validering med Zod, timeout och begripliga felmeddelanden. Med en adapter per tjänst är det bara en fil som påverkas om en tjänst ändras. 

## 3. Integrera eller bygga själv

- **Stripe** hade varit svårast att bygga själv. Det skulle kräva avtal med banker och kortnätverk, PCI DSS certifiering, 3D Secure och begrägeriskydd, mycket kod och ännu mer säkerhet. 

- **Algolia**: en enkel sökning med `LIKE` i databasen går att bygga, men stavfeltolerans, relevansordning och snabba filter skulle kräva en egen sökmotor med dirft och underhåll.

- **Supabase Storage** ger lagring och publika länkar utan egna servrar och diskar.

- **PostNord** går inte att bygga själv alls, eftersom ombuden och transporttiderna finns bara hos PostNord.

- **Frankfurter** ger kurser från ECB, som butiken inte kan ta fram på egen han.

Fraktpriserna bbyggde jag däremot själv. PostNord har inget pris API för Sverige, och en enkel prislista med 59 kr för ombud, 99 kr för hemleverans och fri frakt från 500 kr är så lite kod att en integration inte behövs. Dessutom fungerar den även när PostNord är nere.

## 4. När en tjänst är nere

Jag stötte själv på flera fel under arbetet, och de visade varför felhanteringen behövs:

- När **PostNord** svarade 502, eller när jag skrev ett postnummer som inte finns, visades priserna ändå och hemleverans gick att välja. Ett felaktigt postnummer ger "Kontrollera att postnumret stämmer" i stället för att kassan kraschar. 
- När **Algolias** sorteringsindex saknades visades "Sökningen är inte tillgänglig just nu", medan resten av butiken fungerande.
- Om **Supabase Storage** inte svarar får admin ett meddelande, och produkten behåller sin gamla bild. Om **Frankfurter** inte svarar visas priserna i SEK.

Varje anrop har en timeout, så att butiken inte väntar i all evighet.

## 5. Risker med beroendet

**Persondata (GDPR).** Stipe får kundens e-post och betalning, PostNord får postnumret och Supabase lagrar namn och adress. I en riktig butik skulle det kräva personuppgiftsbiträdesavtal och att integritetspolicyn talar om vilka företag som tar emot uppgifterna.

**Ändrade API:er** under Labb 5 föreslog Claude PostNords Transit Time API, som i sandlådan bara svarade med 502. Det API som gäller idag heter Delivery Options, och det krävde dessutom en gatuadress som inte var markerad som obligatorsik. Tjänster ändras utan att vi bestämmer över det. Tack vare adaptern behövde bara en fil srkivas om.

**Kostnad.** Stripe tar en avgift per köp, och Algolia och Supabase är gratis bara upp till en viss gräns. Växer ReLoved så kan kostnaderna öka snabt. 