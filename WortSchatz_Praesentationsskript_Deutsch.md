# WortSchatz — Das Sprechermanuskript (Vortragsskript)
## Intelligentes deutsches PDF-Lern- & Morphologie-Toolkit
### Ausführlicher Rede- und Moderationstext für eine 22–25-minütige Fachpräsentation

---

> **Regie- und Sprecherhinweise für den Vortragenden:**
> * **Geschätzte Gesamtdauer:** ca. 22 – 25 Minuten (bei ca. 125 – 135 Wörtern pro Minute).
> * **Rhetorisches Tempo:** Ruhig, souverän, technisch präzise und akzentuiert. Wichtige Fachbegriffe und Zahlen bewusst betonen.
> * **Regie-Kürzel:**
>   * `[Klick]` $\to$ Weiterschalten zur nächsten Folie / Animation.
>   * `[Pause]` $\to$ Bewusste Sprechpause (1–2 Sekunden) zur kognitiven Verankerung.
>   * `[Betonung]` $\to$ Modulierte Stimmhebung bei Kernargumenten.
>   * `[Blick]` $\to$ Blickkontakt zum Auditorium / Gremium aufbauen.

---

## ⏱️ Zeit- & Ablaufplan im Überblick

| Folie | Thema | Zeitfenster | Dauer |
| :---: | :--- | :---: | :---: |
| **01** | Titelfolie & Einführung | 00:00 – 01:15 | 1:15 min |
| **02** | Die Kernherausforderung der deutschen Sprache | 01:15 – 02:30 | 1:15 min |
| **03** | Produktphilosophie & Leitprinzipien | 02:30 – 03:40 | 1:10 min |
| **04** | Zielgruppen & Persona-Analyse | 03:40 – 04:55 | 1:15 min |
| **05** | Systemarchitektur & Flat-Client-Stack | 04:55 – 06:10 | 1:15 min |
| **06** | Dual-Layer PDF Rendering & Interaktion | 06:10 – 07:25 | 1:15 min |
| **07** | Der Morphologie-Zerleger (5-Stufen-Pipeline) | 07:25 – 08:45 | 1:20 min |
| **08** | Inseparable Prefix Protection Barrier | 08:45 – 10:05 | 1:20 min |
| **09** | Trennbare Verben Matrix & Longest-Prefix-First | 10:05 – 11:25 | 1:20 min |
| **10** | Cross-Umlaut Normalizer (Vokalwechsel) | 11:25 – 12:40 | 1:15 min |
| **11** | UI/UX Design System (Apple / Linear Ästhetik) | 12:40 – 13:50 | 1:10 min |
| **12** | Die Dual-State Vokabelkarte (iOS Master Toggle) | 13:50 – 15:05 | 1:15 min |
| **13** | Sub-Pill Filterleiste (Interaktive Exploration) | 15:05 – 16:15 | 1:10 min |
| **14** | Lokale Übersetzungs-Kaskade & Komposita-Zerleger | 16:15 – 17:30 | 1:15 min |
| **15** | Vektor-PDF-Export & Byte-Level Annotationen | 17:30 – 18:45 | 1:15 min |
| **16** | Obsidian & PKM Integration (Zettelkasten) | 18:45 – 19:55 | 1:10 min |
| **17** | Flashcard-Studio & Active Recall (3D Flip) | 19:55 – 21:05 | 1:10 min |
| **18** | Datenschutz, 100% DSGVO & Standalone-Build | 21:05 – 22:15 | 1:10 min |
| **19** | Qualitätssicherung & Testmatrix (52 Checkpoints) | 22:15 – 23:25 | 1:10 min |
| **20** | Fazit & Strategische Roadmap v3.0 | 23:25 – 24:45 | 1:20 min |

---

## 🎙️ Vollständiger Sprechtext (Folien 1 bis 20)

---

### Folie 01: Titelfolie — WortSchatz: Intelligentes deutsches PDF-Lern- & Morphologie-Toolkit
**Zeitfenster:** `00:00 – 01:15` | **Wortanzahl:** ~165 Wörter  
**Regie:** *Ruhiger Beginn, offene Haltung, Blick ins Publikum.*

> „Guten Tag, sehr geehrte Damen und Herren, liebe Kolleginnen und Kollegen.
> 
> Ich freue mich sehr, Ihnen heute **WortSchatz** vorstellen zu dürfen — ein innovatives, intelligentes PDF-Lern- und Morphologie-Toolkit, das speziell dafür entwickelt wurde, eine der größten Hürden beim Meistern der deutschen Sprache im akademischen und beruflichen Alltag zu überwinden.
> 
> Wer jemals versucht hat, deutsche Fachtexte, juristische Dokumente oder wissenschaftliche Publikationen zu lesen, stößt unweigerlich auf Wörter wie *Rechtsschutzversicherungsgesellschaften* oder trennbare Verben, deren Bestandteile sich über den halben Satz verteilen. 
> 
> `[Betonung]` WortSchatz schließt genau diese Lücke. Wir haben nicht einfach einen weiteren PDF-Reader gebaut, sondern eine hochperformante, deterministische linguistische Engine geschaffen, die Wörter in Echtzeit dekompiliert, grammatikalische Wurzeln freilegt und den Lesefluss revolutioniert — und das **vollständig offline**, ohne Serverlatenz und zu **100 Prozent DSGVO-konform**.
> 
> Lassen Sie uns gemeinsam einen Blick darauf werfen, welche Probleme wir lösen, wie unsere Technologie im Detail funktioniert und welchen Mehrwert WortSchatz stiftet.“

`[Klick zu Folie 02]`

---

### Folie 02: Die Kernherausforderung der deutschen Sprache
**Zeitfenster:** `01:15 – 02:30` | **Wortanzahl:** ~175 Wörter  
**Regie:** *Problemorientiert sprechen, die Schmerzpunkte greifbar machen.*

> „Beginnen wir mit der eigentlichen Wurzel des Problems: der strukturellen Komplexität der deutschen Grammatik. `[Pause]`
> 
> Jeder, der Deutsch auf dem Niveau B1, B2 oder C1 lernt, scheitert im Alltag an drei typischen Phänomenen:
> 
> Erstens: **Agglutination und endlose Komposita**. Die deutsche Sprache erlaubt es, Substantive fast beliebig aneinanderzureihen. Wörter mit 30 oder 40 Buchstaben sind keine Seltenheit. Herkömmliche Wörterbücher finden solche Ad-hoc-Zusammensetzungen schlichtweg nicht. Der Leser bleibt frustriert zurück.
> 
> Zweitens: **Trennbare Verben und das Phänomen der Satzklammer**. Wenn ein Satz lautet: *‚Das Unternehmen stellt das Produkt nach eingehender Prüfung schließlich ein‘*, dann muss der Lernende das Verb *‚einstellen‘* erfassen — nicht *‚stellen‘*. Diese Präfixe verändern die Bedeutung oft um 180 Grad.
> 
> Und drittens: **Tool-Fragmentierung**. Bisher kopieren Nutzer mühsam Wörter aus dem PDF in externe Browser-Tabs, nutzen Cloud-Übersetzer, verlieren den Lesekontext und haben am Ende des Tages keine Möglichkeit, ihr Gelerntes strukturiert abzuspeichern. 
> 
> `[Betonung]` Das Ergebnis sind kognitive Überlastung und ein massiver Produktivitätsverlust.“

`[Klick zu Folie 03]`

---

### Folie 03: Vision & Produktphilosophie
**Zeitfenster:** `02:30 – 03:40` | **Wortanzahl:** ~160 Wörter  
**Regie:** *Klar und prinzipientreu vortragen. Vision vermitteln.*

> „Um diese Herausforderung nachhaltig zu lösen, haben wir WortSchatz auf vier unverrückbaren Produktprinzipien aufgebaut:
> 
> `[Aufzählung mit Betonung]`
> 1. **Minimal Default UI**: Wenn Sie ein Wort anklicken, wollen Sie nicht von einem 500-Zeilen-Lexikoneintrag erschlagen werden. Sie erhalten in Sekundenbruchteilen eine minimalistische, glasklare Übersetzung und die Stammform. Ihr Lesefluss wird geschützt.
> 2. **On-Demand Deep-Dive**: Möchten Sie tiefer einsteigen? Ein einziger Klick auf unseren iOS-inspirierten Master-Toggle expandiert die gesamte Wortfamilie, Vorsilben, Nachsilben und Konjugationstabellen.
> 3. **Zero-Hallucination Engine**: Wir vertrauen bei der Kernzerlegung nicht auf unberechenbare generative KI-Modelle, die Wörter erfinden. Unsere Engine arbeitet deterministisch und streng regelbasiert.
> 4. **100% Offline & Client-Side**: Ihre Dokumente, Notizen und Passagen verlassen niemals Ihr Endgerät. WortSchatz benötigt keine Cloud, keine Anmeldung und keine Internetverbindung.“

`[Klick zu Folie 04]`

---

### Folie 04: Zielgruppen & Persona-Analyse
**Zeitfenster:** `03:40 – 04:55` | **Wortanzahl:** ~170 Wörter  
**Regie:** *Empathisch, konkrete Beispiele aus dem echten Leben hervorheben.*

> „Für wen haben wir WortSchatz entwickelt? Lassen Sie uns drei archetypische Anwender betrachten:
> 
> Da ist zunächst **Dr. Elena Rostova**, eine internationale Bauingenieurin auf B2/C1-Niveau. Sie muss täglich deutsche DIN-Normen und Projektstatiken prüfen. Früher hat sie pro Fachtext bis zu 45 Minuten mit externen Wörterbüchern verbracht. Mit WortSchatz dekompiliert sie technische Mehrfach-Komposita direkt im Plan.
> 
> Dann haben wir **Lucas Moretti**, Master-Student an der TU München auf B1-Plus-Niveau. Er bereitet sich auf die TestDaF-Prüfung vor und liest wissenschaftliche Paper. Für ihn sind die automatische Wortfamilien-Analyse und der direkte Markdown-Export in seinen Obsidian-Zettelkasten der entscheidende Hebel.
> 
> Und schließlich **Priya Sharma**, Pflegefachkraft im Anerkennungsverfahren. Sie trainiert medizinische Dokumentationen und Fachtermini mit unserem integrierten 3D-Flip Flashcard-Studio und nutzt die native Audio-Aussprache zur Festigung.
> 
> `[Pause]` WortSchatz richtet sich an Menschen, die Deutsch nicht nur als Hobby lernen, sondern in Beruf und Studium darauf angewiesen sind.“

`[Klick zu Folie 05]`

---

### Folie 05: Systemarchitektur & Technologiestack
**Zeitfenster:** `04:55 – 06:10` | **Wortanzahl:** ~165 Wörter  
**Regie:** *Technischer Wechsel: Strukturiert, präzise, architekturbewusst.*

> „Kommen wir zum Maschinenraum von WortSchatz: Wie ist das System aufgebaut?
> 
> Wir haben uns bewusst für eine **Flat Client Architecture** entschieden. Es gibt keinen Node-Backend-Server, keine containerisierte Cloud-Infrastruktur und keine Datenbanken, die synchronisiert werden müssen.
> 
> Das System gliedert sich in drei Schichten:
> 
> Die **Präsentationsschicht** basiert auf modernem HTML5 Canvas in Kombination mit einem hochmodernen Glassmorphism-UI-System nach Apple- und Linear-Standards.
> 
> Das Herzstück ist die **GermanMorphologyEngine**. Sie führt die morphologische Dekompilierung, Stammwiederherstellung und Präfix-Auflösung in purem, hochoptimiertem JavaScript aus.
> 
> Die **Persistenz- und I/O-Schicht** nutzt die leistungsfähige PDF-Lib-Bibliothek zur echten Vektor-Modifikation von Dokumenten sowie IndexedDB und LocalStorage für Notizen.
> 
> `[Betonung]` Dieser Stack ermöglicht es uns, die gesamte Applikation als autarkes Single-File-Bundle auszuliefern, das direkt in jedem modernen Browser startet.“

`[Klick zu Folie 06]`

---

### Folie 06: PDF-Rendering & Interaktions-Engine
**Zeitfenster:** `06:10 – 07:25` | **Wortanzahl:** ~160 Wörter  
**Regie:** *Erklären, warum Standard-PDF-Ansätze oft scheitern und wie WortSchatz es löst.*

> „Ein zentraler technischer Knackpunkt war das PDF-Rendering. Wenn Sie in einem Dokument auf ein Wort klicken, muss das System millimetergenau wissen, um welches Zeichen und welches Bounding-Box-Rechteck es sich handelt.
> 
> Wir setzen hier auf eine **Dual-Layer-Architektur**:
> 
> 1. Die **untere Ebene** ist ein hochauflösender HTML5 Canvas, der das Dokument über PDF.js mit 1,5-facher HiDPI-Skalierung gestochen scharf darstellt.
> 2. Die **obere Ebene** ist ein absolut deckungsgleiches, transparentes Text-Layer. Jedes Wort liegt als eigenständiger HTML-Span exakt über dem gerenderten Buchstabenbild.
> 3. Darüber liegt ein **Annotation Canvas**, auf dem Textmarker-Highlights in Gelb, Grün, Blau und Rosa gezeichnet werden.
> 
> Über eine Viewport-Transformationsmatrix synchronisieren wir Mauskoordinaten, Klicks und Gesten in Echtzeit. Selbst bei schnellem Scrollen durch 500-seitige Handbücher bleibt die Oberfläche butterweich bei stabilen 60 Frames pro Sekunde.“

`[Klick zu Folie 07]`

---

### Folie 07: Der Morphologie-Zerleger (5-Stufen-Pipeline)
**Zeitfenster:** `07:25 – 08:45` | **Wortanzahl:** ~180 Wörter  
**Regie:** *Kernfolie der Linguistik: Betone die Latenz und die logische Abfolge.*

> „Lassen Sie uns nun die `GermanMorphologyEngine` im Detail betrachten. Was passiert, wenn der Nutzer auf ein Wort klickt?
> 
> Innerhalb von **unter 0,1 Millisekunden** durchläuft das Wort eine hochpräzise fünfstufige Pipeline:
> 
> `[Aufzählung]`
> * **Schritt 1:** *Token-Bereinigung*. Satzzeichen, Sonderzeichen und Leerzeichen werden bereinigt, Groß- und Kleinschreibung isoliert.
> * **Schritt 2:** *Inseparable Prefix Barrier*. Das Wort wird sofort darauf geprüft, ob es eine untrennbare Vorsilbe wie `be-`, `ge-` oder `ver-` besitzt. Dies schützt vor fatalen Fehlzerlegungen.
> * **Schritt 3:** *Cross-Umlaut Normalizer*. Flektierte Formen wie *‚fängt‘* werden auf ihren Basisvokal *‚fang‘* zurückgeführt.
> * **Schritt 4:** *Longest-Prefix-First Matcher*. Das System gleicht 40+ trennbare Präfixe gegen 240+ validierte Stammwurzeln ab.
> * **Schritt 5:** *Aggregation*. Aus den morphologischen Bausteinen wird die interaktive Vokabelkarte mit Übersetzungen, Wortfamilien und Konjugationen erzeugt.
> 
> `[Pause]` Das ist deterministische Linguistik in Reinform — schnell, exakt und reproduzierbar.“

`[Klick zu Folie 08]`

---

### Folie 08: Inseparable Prefix Protection Barrier
**Zeitfenster:** `08:45 – 10:05` | **Wortanzahl:** ~175 Wörter  
**Regie:** *Spannungsbogen aufbauen: Zeige das Problem naiver Parser und die Lösung.*

> „Warum ist Schritt 2 — die *Inseparable Prefix Protection Barrier* — so entscheidend?
> 
> Schauen wir uns an, was herkömmliche, naive Parsing-Algorithmen tun:
> 
> `[Beispiel hervorheben]` Nehmen wir das Wort **‚beantworten‘**. Ein naiver Trennungsalgorithmus sucht nach bekannten Präfixen wie `an-`. Er schneidet `an-` ab und kombiniert den Rest zu dem völlig sinnlosen Kunstwort *‚betworten‘*. 
> Oder nehmen wir **‚gestehen‘**: Ein naiver Parser sieht `ge-` fälschlicherweise als Partizip-Präfix und verweist auf *‚stehen‘*. Das ist linguistischer Unfug und verwirrt Sprachschüler massiv!
> 
> WortSchatz löst dies durch eine unüberwindbare Schutzbarriere:
> Untrennbare Vorsilben — `be-`, `ge-`, `er-`, `ver-`, `zer-`, `ent-`, `empf-` und `miss-` — werden als feste Barriere deklariert. 
> 
> Das Wort *‚beantworten‘* wird geschützt und korrekt auf seine Stammwurzel **‚antworten‘** zurückgeführt. 
> `[Betonung]` Dadurch generiert WortSchatz die vollständige, korrekte Wortfamilie: *antworten, beantworten, verantworten* — ohne jemals eine Halluzination zu erzeugen.“

`[Klick zu Folie 09]`

---

### Folie 09: Trennbare Verben Matrix & Longest-Prefix-First
**Zeitfenster:** `10:05 – 11:25` | **Wortanzahl:** ~170 Wörter  
**Regie:** *Algorithmischen Vorteil erklären: Warum 'Longest-Prefix-First'?*

> „Ein weiteres Glanzstück unserer Engine ist die **Trennbare Verben Matrix** mit dem *Longest-Prefix-First-Algorithmus*.
> 
> In der deutschen Sprache gibt es sowohl kurze Präfixe wie `zu-` als auch mehrsilbige wie `zurück-` oder `zusammen-`.
> 
> Würde man das Wort **‚zurückkehren‘** mit einer einfachen Präfixliste abgleichen, könnte das kurze `zu-` zuerst matchen. Das Ergebnis wäre das Fragment *‚rückkehren‘*.
> 
> `[Betonung]` Unser *Longest-Prefix-First-Ansatz* sortiert alle Präfixe strikt nach absteigender Zeichenlänge. Er erkennt sofort `zurück-` als ganzheitliche Einheit und isoliert den Stamm `kehren`.
> 
> Wir haben über **240 Stammwurzeln** manuell linguistisch kartiert — von *bauen, binden, brechen* bis hin zu *ziehen, zwingen*. Für jede Wurzel kennt WortSchatz die exakten real existierenden Ableitungen. Bei *‚führen‘* sind das *abführen, anführen, aufführen, einführen, vorführen, zurückführen* — jedes mit seiner individuellen Bedeutungsnuance.“

`[Klick zu Folie 10]`

---

### Folie 10: Cross-Umlaut Normalizer (Vokalwechsel)
**Zeitfenster:** `11:25 – 12:40` | **Wortanzahl:** ~165 Wörter  
**Regie:** *Verdeutlichung anhand starker Verben.*

> „Deutsche starke Verben ändern bei der Konjugation ihren Stammvokal.
> 
> Im Text steht selten der Infinitiv *‚anfangen‘*. Dort steht: *‚Er fängt an‘* oder *‚Sie liefen los‘* oder *‚Das Gesetz tritt in Kraft‘*.
> 
> Für einen Standard-Suchalgorithmus ist der Stamm `fäng-` völlig fremd. Er findet keine Verbindung zu `fangen`.
> 
> Hier greift unser **Cross-Umlaut Normalizer**:
> Er führt ein dynamisches, bidirektionales Vokal-Mapping durch:
> * `ä` wird auf `a` zurückgeführt (`fängt` $\to$ `fangen`, `fährt` $\to$ `fahren`, `trägt` $\to$ `tragen`).
> * `ö` wird auf `o` abgebildet (`stößt` $\to$ `stoßen`).
> * `ü` wird auf `u` normalisiert (`muss` / `müssen`).
> * `ie` und `i` werden mit `e` abgeglichen (`sieht` $\to$ `sehen`, `tritt` $\to$ `treten`).
> 
> `[Pause]` Selbst Partizip-II-Formen mit ge-Infix wie *‚angefangen‘* werden nahtlos dekonstruiert. Der Lernende sieht immer die richtige Grundform.“

`[Klick zu Folie 11]`

---

### Folie 11: UI/UX Design System (Apple & Linear Ästhetik)
**Zeitfenster:** `12:40 – 13:50` | **Wortanzahl:** ~155 Wörter  
**Regie:** *Fokus auf Benutzererlebnis, Eleganz und Ergonomie.*

> „Hervorragende Technologie nützt nichts, wenn die Bedienung frustriert. Deshalb haben wir bei WortSchatz höchste Maßstäbe an das UI/UX-Design angelegt, inspiriert von den Designsystemen von Apple und Linear.
> 
> `[Merkmale hervorheben]`
> * **Dark-First Slate Theme**: Ein tiefes, augenschonendes Schieferblau (`#0B0F19`) verhindert Ermüdung bei stundenlangen Lerneinheiten.
> * **Glassmorphism**: Semitransparente Ebenen mit dezentem 12-Pixel-Blur lassen das Originaldokument im Hintergrund spürbar bleiben.
> * **Semantische Farblehre**: Jede Wortart besitzt ihre unverwechselbare Farbe — Nomen in Blau, Verben in Smaragdgrün, Adjektive in warmem Bernstein, Partikeln in Violett.
> * **Power-User Hotkeys**: Mit den Tasten `H` (Highlight), `N` (Notiz) und `F` (Flashcard) lässt sich die gesamte Applikation blitzschnell per Tastatur steuern.“

`[Klick zu Folie 12]`

---

### Folie 12: Die Dual-State Vokabelkarte
**Zeitfenster:** `13:50 – 15:05` | **Wortanzahl:** ~165 Wörter  
**Regie:** *Das Kern-UI-Element vorstellen. Den Umschalt-Effekt betonen.*

> „Lassen Sie uns das Herzstück der Interaktion betrachten: **Die Dual-State Vokabelkarte**.
> 
> Bei einem Klick öffnet sich die Karte im **Kompaktmodus**:
> Sie sehen das Wort, seinen grammatikalischen Artikel *der/die/das*, die phonetische IPA-Ausschrift, die Kernbedeutung und Schnellaktions-Buttons für Audio und Notizen. Nicht mehr und nicht weniger.
> 
> Doch rechts oben befindet sich unser **iOS-Style Master-Toggle**.
> 
> `[Betonung]` Schaltet der Nutzer diesen Schalter um, entfaltet sich die Karte mit einer flüssigen 60-FPS-Animation in den **Erweiterten Analysemodus**:
> Plötzlich stehen Ihnen das komplette Wortfamilien-Gitter, Präfix- und Suffix-Aufschlüsselungen, Konjugationstabellen für alle Zeitformen sowie authentische Beispielsätze zur Verfügung.
> 
> Der Nutzer entscheidet zu jedem Zeitpunkt selbst, wie tief er in die Grammatik eintauchen möchte.“

`[Klick zu Folie 13]`

---

### Folie 13: Sub-Pill Filterleiste
**Zeitfenster:** `15:05 – 16:15` | **Wortanzahl:** ~155 Wörter  
**Regie:** *Interaktivität und Discovery-Effekt erklären.*

> „Im erweiterten Modus bietet WortSchatz eine intuitive **Sub-Pill Filterleiste**, mit der Sprachschüler sprachliche Zusammenhänge spielerisch erkunden können.
> 
> Vier interaktive Filterkategorien stehen bereit:
> 
> 1. **Wortfamilie**: Zeigt alle abgeleiteten Substantive, Verben und Adjektive (z.B. *Antwort, Beantwortung, verantwortlich*).
> 2. **Präfixe**: Filtert isoliert nach untrennbaren Präfixen, um Bedeutungsverschiebungen zu studieren.
> 3. **Trennbare Verben**: Konzentriert sich auf Verben mit Satzklammer-Präfixen und visualisiert die Trennstelle.
> 4. **Suffixe & Ableitungen**: Hebt Endungen wie `-ung`, `-bar`, `-lich` oder `-keit` hervor.
> 
> `[Begeisterung]` Ein Klick auf eine beliebige Pille analysiert sofort das neue Wort. So wird das Lesen eines PDFs zu einer spannenden Entdeckungsreise durch das deutsche Vokabular.“

`[Klick zu Folie 14]`

---

### Folie 14: Lokale Übersetzungs-Kaskade & Komposita-Zerleger
**Zeitfenster:** `16:15 – 17:30` | **Wortanzahl:** ~170 Wörter  
**Regie:** *Erläutere die Komposita-Zerlegung am Monumentalwort.*

> „Wie garantiert WortSchatz blitzschnelle Übersetzungen ohne Cloud-Zwang? Über unsere **dreistufige Übersetzungs-Kaskade**:
> 
> * **Stufe 1** prüft das integrierte Offline-Lexikon in unter 0,1 Millisekunden.
> * Wenn ein Wort dort nicht existiert — weil es ein langes deutsches Kompositum ist —, greift **Stufe 2**: der *rekursive Komposita-Dekomposer*.
> 
> `[Beispiel hervorheben]` Betrachten wir unser Paradebeispiel: **Rechtsschutzversicherungsgesellschaft**.
> Der Dekomposer zerlegt das Wort in seine vier lexikalischen Bausteine:
> 1. *Recht* $\to$ Law / Justice
> 2. *Schutz* $\to$ Protection
> 3. *Versicherung* $\to$ Insurance
> 4. *Gesellschaft* $\to$ Company / Society
> 
> Er synthetisiert daraus die exakte Bedeutung: *‚Legal protection insurance company‘*.
> 
> Und für den Fall, dass doch einmal ganze Phrasen übersetzt werden müssen, steht in **Stufe 3** eine optionale Anbindung an DeepL oder Google Translate bereit. Aber: 95% aller Abfragen lösen wir rein lokal.“

`[Klick zu Folie 15]`

---

### Folie 15: Vektor-PDF-Export & Byte-Level Annotationen
**Zeitfenster:** `17:30 – 18:45` | **Wortanzahl:** ~175 Wörter  
**Regie:** *Technologische Überlegenheit beim Export betonen.*

> „Ein häufiges Manko vieler Web-PDF-Tools ist der Export: Wenn Sie Notizen oder Markierungen speichern wollen, machen diese Apps oft einfach einen Screenshot der Canvas-Seite und erstellen ein neues Bild-PDF.
> 
> `[Kritischer Ton]` Die Folge: Der Text ist nicht mehr durchsuchbar, Schriften werden beim Zoomen matschig und verpixelt, und die Dateigröße explodiert.
> 
> `[Positiver Kontrast]` WortSchatz geht den professionellen Weg:
> Wir nutzen **PDF-Lib zur direkten Byte-Modifikation**. Wenn Sie in WortSchatz ein Highlight setzen, injizieren wir echte, standardkonforme PDF-Annotationsobjekte (`/Highlight` und `/Annot`) direkt in die binäre PDF-Datenstruktur.
> 
> Das bedeutet:
> * **100% Vektorschärfe**: Selbst bei 1000% Zoom bleibt jede Kante gestochen scharf.
> * **Vollständige Portabilität**: Ihre Markierungen sind in Adobe Acrobat, Apple Vorschau, Foxit Reader oder auf dem iPad exakt sichtbar und editierbar.
> * **Kein Datenmüll**: Die Datei wächst nur um minimale wenige Kilobytes.“

`[Klick zu Folie 16]`

---

### Folie 16: Obsidian & PKM Integration (Zettelkasten)
**Zeitfenster:** `18:45 – 19:55` | **Wortanzahl:** ~160 Wörter  
**Regie:** *Verbindung zu modernen Wissensmanagement-Methoden ziehen.*

> „Wissensarbeiter und Studierende lesen heute nicht isoliert — sie pflegen ein ‚zweites Gehirn‘ in Tools wie **Obsidian, Notion oder Logseq**.
> 
> WortSchatz bietet dafür einen **1-Klick Markdown- und Obsidian-Export**:
> 
> Zu jedem markierten Wort wird eine perfekt formatierte Markdown-Notiz generiert:
> * Mit standardisiertem **YAML-Frontmatter** inklusive Datum, PDF-Dateiname, Seitenzahl und Tags.
> * Mit automatischen **Wikilinks** (`[[Stammwort]]`), die im Obsidian-Graphen sofort relationale Wissensnetze zwischen verwandten Wörtern knüpfen.
> * Voll kompatibel mit dem beliebten **Dataview-Plugin** für automatisierte Vokabellisten und Vokabeltabellen.
> 
> Darüber hinaus unterstützen wir den direkten CSV- und Anki-Export für das Karteikartentraining. Gelerntes Wissen geht nie wieder verloren.“

`[Klick zu Folie 17]`

---

### Folie 17: Flashcard-Studio & Active Recall
**Zeitfenster:** `19:55 – 21:05` | **Wortanzahl:** ~160 Wörter  
**Regie:** *Lernpsychologie und Spaced Repetition ansprechen.*

> „Vokabeln im Text zu verstehen ist der erste Schritt — sie dauerhaft im Langzeitgedächtnis zu verankern, der entscheidende zweite.
> 
> Dafür verfügt WortSchatz über ein integriertes **Flashcard-Studio**, das auf den Prinzipien des *Active Recall* und der *Spaced Repetition* basiert.
> 
> `[Funktionen skizzieren]`
> * **3D-Flip Karte**: Die Vorderseite zeigt den Satzkontext mit Lückentext. Ein Klick dreht die Karte in flüssigem 3D und enthüllt Übersetzung, Wortfamilie und Grammatiktipps.
> * **Audio-Integration**: Festigung der korrekten Phonetik über die Web Speech API.
> * **Leitner-Wiederholungsalgorithmus**: Wörter werden anhand des individuellen Schwierigkeitsgrades (Stufen 1 bis 4) in optimalen zeitlichen Intervallen erneut vorgelegt.
> * **Konjugations-Drills**: Gezieltes Abfragen von unregelmäßigen Vergangenheitsformen (Präteritum und Partizip II).“

`[Klick zu Folie 18]`

---

### Folie 18: Datenschutz, 100% DSGVO & Standalone-Build
**Zeitfenster:** `21:05 – 22:15` | **Wortanzahl:** ~165 Wörter  
**Regie:** *Souveränität, Enterprise-Sicherheit und Datenschutz betonen.*

> „Lassen Sie uns über einen Aspekt sprechen, der für Unternehmen, Kanzleien und Behörden unverzichtbar ist: **Datensicherheit und DSGVO**.
> 
> Wenn Mitarbeiter vertrauliche Verträge, Patentschriften oder medizinische Gutachten lesen, dürfen diese Dokumente unter keinen Umständen über ungesicherte Cloud-Server laufen.
> 
> WortSchatz garantiert **Zero-Telemetry und 100% Client-Side-Verarbeitung**:
> Es gibt keine externen API-Calls, keine Tracker, keine Cookies und keine Speicherung auf Drittservern.
> 
> Mit unserem **Standalone-Build** — der Datei `WortSchatz_Standalone.html` — liefern wir das gesamte Ökosystem in einer einzigen, autarken Datei aus. 
> `[Betonung]` Sie können diese Datei auf einen USB-Stick ziehen, in den Flugmodus schalten und haben die volle Power von WortSchatz überall griffbereit — ohne jegliche Softwareinstallation.“

`[Klick zu Folie 19]`

---

### Folie 19: Qualitätssicherung & Testmatrix (52 Checkpoints)
**Zeitfenster:** `22:15 – 23:25` | **Wortanzahl:** ~165 Wörter  
**Regie:** *Zahlen und QA-Fakten überzeugend präsentieren.*

> „Wie stellen wir sicher, dass WortSchatz in jeder Situation stabil und fehlerfrei arbeitet?
> 
> Wir haben das System einer rigorosen, dreigliedrigen Qualitätssicherungs-Matrix mit **52 definierten Test-Checkpoints** unterzogen:
> 
> * **25 Morphologie-Tests**: Verifikation der Präfix-Schutzbarriere, Umlaut-Normalisierung und Komposita-Dekomposition. Ergebnis: **0% Falsch-Positiv-Rate** bei untrennbaren Verben wie *beantworten* oder *gestehen*.
> * **15 UI- & Toggle-Tests**: Stresstests für den iOS-Master-Toggle, Sub-Pill-Filter und responsive Viewports bei extremen Display-Auflösungen.
> * **12 Export- & Vektor-Tests**: Validierung der PDF-Lib Byte-Integrität in Adobe Acrobat und Apple Vorschau sowie Syntaxprüfung des Obsidian-Markdowns.
> 
> Über **240 Verbwurzeln** sind vollständig linguistisch verifiziert. WortSchatz ist kein Prototyp, sondern ein hochgradig ausgereiftes Produktionssystem.“

`[Klick zu Folie 20]`

---

### Folie 20: Fazit & Strategische Roadmap v3.0
**Zeitfenster:** `23:25 – 24:45` | **Wortanzahl:** ~185 Wörter  
**Regie:** *Starkes, inspirierendes Finale. Blick in die Zukunft.*

> „Fassen wir zusammen:
> 
> Mit WortSchatz haben wir eine Brücke geschlagen zwischen **linguistischer Präzision**, **moderner UI-Ästhetik** und **kompromisslosem Datenschutz**. 
> 
> Wir verwandeln das Lesen komplexer deutscher Fachtexte von einer mühsamen Frustration in ein flüssiges, lehrreiches und motivierendes Erlebnis.
> 
> `[Ausblick / Roadmap]`
> Wie sieht die Zukunft aus? Für die Version 3.0 stehen bereits spannende Meilensteine auf unserer Roadmap:
> 1. **Der Satzklammer-Auto-Linker**: Eine visuelle Kurve im PDF, die getrennte Verben und ihre am Satzende stehenden Präfixe im Originaldokument automatisch miteinander verbindet.
> 2. **End-to-End verschlüsselter WebDAV-Sync**: Für nahtlosen Abgleich zwischen Desktop, iPad und mobilen Endgeräten.
> 3. **Community-Fachwörterbücher**: Spezialmodule für Medizin, Jura, Bauingenieurwesen und Wirtschaftswissenschaften.
> 
> `[Blick ins Publikum, Schlusssatz]`
> Ich danke Ihnen ganz herzlich für Ihre Aufmerksamkeit und freue mich nun auf Ihre Fragen und eine anregende Diskussion. Vielen Dank!“

---

## 💡 Tipps für die Fragerunde (Q&A / FAQ-Leitfaden)

> * **Frage:** *„Warum nutzen Sie für die morphologische Zerlegung kein LLM wie GPT-4 oder Claude?“*
>   * **Antwort:** *„LLMs haben drei entscheidende Nachteile für diesen Anwendungsfall: Erstens Latenz (500–1500 ms statt <0,1 ms lokal), zweitens Halluzinationsgefahr bei seltenen Komposita und drittens Datenschutzrisiken durch Cloud-Übertragung. Unser deterministischer Algorithmus ist 1000-mal schneller, fehlerfrei und funktioniert offline.“*
>
> * **Frage:** *„Funktioniert WortSchatz auch mit gescannten PDFs ohne Textlayer?“*
>   * **Antwort:** *„WortSchatz setzt auf durchsuchbaren Text (TextLayer) auf. Für rein bildbasierte Scans empfehlen wir einen kurzen lokalen OCR-Durchlauf (z.B. mit Tesseract oder Apple OCR), danach greift WortSchatz mit allen Features.“*
>
> * **Frage:** *„Wie flexibel ist der Export für andere Vokabeltrainer?“*
>   * **Antwort:** *„Neben dem nativen Flashcard-Studio exportiert WortSchatz mit einem Klick in Standard-CSV, Markdown und Anki-kompatible Tab-Separated Formate mit Tags und Kontextfeldern.“*

---
*Ende des Manuskripts.*
