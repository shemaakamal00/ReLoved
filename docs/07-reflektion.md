# Reflektion

*Inlämningsuppgift 1 – Integrera shoppen med omvärlden

## 1. Integrationsmodell

ReLoved använder flera integrationsmodeller, och valet beror på hur datan rör sig mellan butiken och tjänsten.

- **Fil (CSV och XML)** för leverantörens produktkatalog. En katalog levereras som en helhet och läses in då och då. Importen gör upsert på artikelnumret, så att samma katalog kan importeras flera gånger utan att produkterna dupliceras.

- **REST** för leverantörs API:et, Frankfurter (valutakurser) och PostNord (ombud och leveranstid). Det är enkla frågor som "Vilka ombud finns nära 41101?", där servern frågar när den behöver svaret.

- **SDK** för Algolia, Stripe och Supabase Storage. SDK:n bygger REST, men sköter autentisering och format åt oss.

- **Redirect och webhook** för Stripe. Kunden skickas till Stripes egen betalsida och tillbaka igen. Själva bekräftelsen kommer som en signerad webhook direkt från Stripe till servern. Detta är nödvändigt, eftersom kunden kan stänga fliken efter betalningen och webhooken kan komma före eller efter att kunden har kommit tillbaka. Därför är det bara webhooken som får göra en order betald. 

Algolia var den integrationen som kändes mest annorlunda. Jag är van vid att sökningen kodas i själva appen, men här skickas produkterna till en extern tjänst som håller ett eget index. Databasen är fortfarande "sanningen", och Algolia är en kopia som måste hållas i takt med den. 

## 2. Varför via Express och inte direkt från React

Allt som körs i React körs i kundens webbläsare, och där kan vem som helst öppna DevTools och se koden, nätverksanropen och alla nycklar. Om React anropade Stripe, Algolia eller PostNord direkt skulle de hemliga nycklarna behöva finnas i webbläsaren. Med Stripes nyckel skulle vem som helst kunna skapa betalningar eller återbetalningar i butikens namn. 

Det handlar också om att kunna lita på datan. Om React räknade ut priset och frakten skulle en kund kunna ändra dem innan beställningen skickas. I ReLoved skickar React bara vilka produkter kunden köper och vilket fraktalternativ och ombud kunden har valt. Servern hämtar priserna från databasen, räknar ut frakten och frågar PostNord igen om ombudet verkligen finns för postnumret. Express blir dessutom ett enda ställe för validering med Zod, timeout och begripliga felmeddelanden. Med en adapter per tjänst är det bara en fil som påverkas om en tjänst ändras. 

## 3. Integrera eller bygga själv

- **Stripe** hade varit svårast att bygga själv. Det skulle kräva avtal med banker och kortnätverk, PCI DSS certifiering, 3D Secure och bedrägeriskydd, mycket kod och ännu mer säkerhet. I ReLoved räcker det i stället att servern skapar en betalsession och tar emot Stripes webhook, där databasfunktionen `mark_order_paid` gör ordern betalad och minskar lagret exakt en gång.

- **Algolia**: en enkel sökning med `LIKE` i databasen går att bygga, men stavfeltolerans, relevansordning och snabba filter skulle kräva en egen sökmotor med drift och underhåll.

- **Supabase Storage** ger lagring och publika länkar utan egna servrar och diskar.

- **PostNord** går inte att bygga själv alls, eftersom ombuden och transporttiderna finns bara hos PostNord.

- **Frankfurter** ger kurser från ECB, som butiken inte kan ta fram på egen hand.

Fraktpriserna byggde jag däremot själv. PostNord har inget pris API för Sverige, och en enkel prislista med 59 kr för ombud, 99 kr för hemleverans och fri frakt från 500 kr är så lite kod att en integration inte behövs. Dessutom fungerar den även när PostNord är nere.

## 4. När en tjänst är nere

Jag stötte själv på flera fel under arbetet, och de visade varför felhanteringen behövs:

- När **PostNord** svarade 502, eller när jag skrev ett postnummer som inte finns, visades priserna ändå och hemleverans gick att välja. Ett felaktigt postnummer ger "Kontrollera att postnumret stämmer" i stället för att kassan kraschar. 
- När **Algolias** sorteringsindex saknades visades "Sökningen är inte tillgänglig just nu", medan resten av butiken fungerade.
- Om **Supabase Storage** inte svarar får admin ett meddelande, och produkten behåller sin gamla bild. Om **Frankfurter** inte svarar visas priserna i SEK.

Varje anrop har en timeout, så att butiken inte väntar i all evighet.

## 5. Risker med beroendet

**Persondata (GDPR).** Stripe får kundens e-post och betalning, PostNord får postnumret och Supabase lagrar namn och adress. I en riktig butik skulle det kräva personuppgiftsbiträdesavtal och att integritetspolicyn talar om vilka företag som tar emot uppgifterna.

**Ändrade API:er.** Under Labb 5 föreslog Claude PostNords Transit Time API, som i sandlådan bara svarade med 502. Det API som gäller idag heter Delivery Options, och det krävde dessutom en gatuadress som inte var markerad som obligatorisk. Tjänster ändras utan att vi bestämmer över det. Tack vare adaptern behövde bara en fil skrivas om.

**Kostnad.** Stripe tar en avgift per köp, och Algolia och Supabase är gratis bara upp till en viss gräns. Växer ReLoved så kan kostnaderna öka snabbt. 

## 6. Kundinloggning med Google

Google och GitHub bygger båda på OAuth 2.0, men jag tyckte att Google var lättare att förstå. Med OpenId Connect skickar Google ett ID token där allt jag behöver redan finns. Alltså vem kunden är (sub), e-post och namn- Jag behövde bara kontrollera att tokenet kom från Google, var utfärdat till ReLoved och inte hade gått ut. Sedan känns kunden igen på sub, som aldrig ändras, även om kunden byter e-postadress.

Innan labben låg innloggningen som en JWT i localStorgare och skickades med i varje anrop. Nu ligger den i en httpOnly cookie, som är säkrare. JavaScript kan inte läsa cookien, så även om någon lyckades köra kod på sidan skulle de inte komma åt inloggningen. Själva övergången var inte svår, men den tog tid eftersom token användes i många filer, från API anropen till varukorgen och favoriterna. För att cookien skulle fungera i den deployade shoppen fick React och API:et ligga på samma adress, så Vercel skickar nu api vidare till Render.

Det svåraste valet var vad som skulle hända om någon redan hade ett konto med lösenord och sedan loggade in med Google med samma e-postadess. Att slå ihop kontona automatiskt låter smidigt, men då litar shoppen på att den som har Google kontot också äger det gamla kontot. Det går inte att veta säkert, och i värsta fall får någon annan tillgång till kunden ordrar och adress. Därför får kunden istället ett meddelande om att logga in med sitt lösenord.

## 7. Admininloggning med GitHub och felrapporter

Det som tog längst tid var felhanteringen mot GitHub. När kodbytet misslyckade svarade GitHub ändå med status 200, och felet stod istället i själva svaret. Jag förstod först inte varför inloggningen inte fungerade fast allt såg ut att gå bra. Där lärde jag mig på ritkigt att man inte kan lita bara på statuskoden, utan måste också validera hela svaret. Det är också därför alla svar från GitHub nu kontrolleras med Zod innan de används.

Jag lärde mig också hur lätt småfel smyger sig in när man skriver snabbt. `Authorixation` i stället för `Authorization` gjorde at anropet gick utan token, och `read: user` med ett mellanslag gjorde att GitHub inte kände igen behörigheten. Inget av felen kraschade något, de gjorde bara att saker inte fungerade som de skulle. Det har fått mig att läsa felmeddelanden och loggar mer noggrant. 

I labben används två olika tokens. Adminens egna token används bara under inloggningen för att ta reda på vem admin är, och sparas aldrig. Shoppens egen token används för att skapa och läsa felrapporter, och den har ara behörighet till issues i ReLoved repo. Om den hade legat i React hade vem som helst kunnat hitta den i webbläsaren och skapa eller ändra issues i shoppens namn.
Att dela upp det och ge varje token så lite behörighet som möjligt gör att skadan blir liten om något ändå skulle läcka.
