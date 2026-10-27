# Kody do skierowań — Clinical Minimal

Stan: 27 października 2026. **Wersja do przeglądu, nie zatwierdzona do produkcji.**

## Co zostało dostarczone

Redesign na bazie przesłanego `kody-skierowan(1).zip`, w izolowanej lokalnej gałęzi `redesign/clinical-minimal`. Nie publikowano na GitHub Pages i nie zmieniano zdalnego repozytorium. W archiwum źródłowym metadane sprawdzenia są z 21 października; publiczna strona podczas audytu pokazywała 27 października. Nie potwierdzono zgodności archiwum z aktualnym HEAD GitHub.

- Kompaktowa wyszukiwarka z widoczną etykietą, lokalnie rysowaną ikoną, wyraźnym focusem i czyszczeniem 44 × 44 px.
- Jedna czytelna kolumna wyników. Na desktopie: kod, treść, ulubione. Na telefonie: kod i ulubione nad nazwą. Pełne nazwy i ścieżki pozostają dostępne.
- Jednoznaczny przycisk kopiowania z samym kodem w osobnym elemencie. Ikona nie trafia do schowka w fallbacku.
- Ulubione z czytelną pustą/pełną gwiazdką, stanem `aria-pressed`, kontekstową etykietą i dotychczasowym kluczem `icd9-favs`.
- Spójne tokeny kolorów, odstępów i promieni w jasnym i ciemnym motywie. Motyw nadal podąża za ustawieniem systemu.
- Mniejsze wcięcia kategorii, poprawiony mobilny układ zagnieżdżonych wyników oraz dotykowe akcje rozwijania.
- Osobna prezentacja resortowych, z wyraźnym objaśnieniem, że nie są procedurami ICD-9.
- Źródła, informacje prawne, daty i zastrzeżenia z zachowaniem całej oryginalnej treści; uporządkowano wyłącznie strukturę i wygląd.
- Semantyczne nagłówki, link pomijający nagłówek, krótki status wyników i stale obecny live region powiadomień.
- Widoczny komunikat offline oraz ostrzeżenie o dawnym sprawdzeniu. Nie wprowadzono nowych zapytań sieciowych o aktualność.
- „Na górę” na listach wyników pojawia się, gdy wyników jest więcej niż pięć. Przycisk w drzewie kategorii zachowano.
- `prefers-reduced-motion` respektowane także przy przewijaniu JavaScript.

## Małe poprawki towarzyszące

1. Uwagi NFZ: selektor zwijania odnajduje element wewnątrz właściwej `.body`, więc wielokrotne rozwijanie nie powinno dokładać kopii.
2. Kopiowanie: stan sukcesu pojawia się tylko po udanym zapisie lub udanym fallbacku.
3. Fokus: usunięcie ulubionego z listy odtwarza fokus; dodanie w drzewie kategorii nie przenosi go na górę.
4. Stan hover nie nadpisuje kolorów potwierdzenia kopiowania.

## Pliki produkcyjne

| Plik | Zmiana |
|---|---|
| `index.html` | Semantyka, etykieta pola, komunikaty statusowe, uporządkowanie źródeł, lokalny arkusz CSS |
| `styles.css` | Nowy kompletny system wizualny i responsywność |
| `app.js` | Prezentacja, etykiety, statusy, kopiowanie i drobne poprawki interakcji |
| `sw.js` | Wyłącznie dodanie `styles.css` do listy cache |
| `.github/workflows/update.yml` | Wyłącznie dodanie `styles.css` do plików kopiowanych do `_site` |
| `manifest.webmanifest` | Kolory oprawy dopasowane do redesignu |

Dodatkowe pliki: `tests/`, `review/porownanie.html`, niniejszy raport i `.gitignore`. Nie są kopiowane przez workflow do paczki produkcyjnej. Brak zależności uruchomieniowych, frameworków, CDN, zewnętrznych fontów, analityki i nowych usług.

## Testy rzeczywiście wykonane

| Obszar | Wynik i granice |
|---|---|
| 25 zapytań referencyjnych | PASS: porównano pełne obiekty wyników, kolejność, nazwy, kontekst i wyniki resortowe; wykonywane rzeczywiste funkcje aplikacji w Node VM |
| Wszystkie wymagane zapytania z briefu | Uwzględnione: `usg tarczycy`, `rtg klatki`, `kolano`, `rehabilitacja`, `93.11`, `88`, `1308`, `4308`, `4309`, `fizjoterapia kardiologiczna` |
| Dodatkowe przypadki | Skróty USG/MR/MRI/RM/TK/CT/EKG/EEG/EMG/KTG/PET, prefiks `88.7`, brak trafień i grupy `tarczyca kolano` |
| 19 testów prezentacji | PASS, z atrapami DOM: dokładny tekst Clipboard API, fallback wybierający sam kod, odmowa kopiowania, etykiety, podświetlenie, start, jeden znak, brak wyników, grupy częściowe, limit 60, kod dziecięcy, aktualność, online/offline, otwórz–zamknij–otwórz uwagi, zapis ulubionych i zarządzanie focusem |
| Niezmienność danych | PASS SHA-256: ICD-9, metadane, `resort.js`, skrypty aktualizacji i konwersji, Dependabot |
| Algorytm wyszukiwania | PASS: niezmienny cały blok JOINTS/alternatywy/search/highlight; wyniki resortowe porównane z referencją |
| Treści prawne | PASS: tekst całej stopki po normalizacji białych znaków i tagów, stałe RES_BANNER i ELI_LINK |
| CSP | PASS: identyczny meta-tag polityki |
| Pakowanie i zasoby | PASS statyczny: wszystkie lokalne odwołania istnieją, CSS w SW i workflow, dokładny marker `nfzmeta`, próbne wstrzyknięcie metadanych |
| Kontrast tokenów | PASS obliczeniowy: 8 par tekst/tło na motyw; minimum 5,60:1 w jasnym i 6,68:1 w ciemnym; obramowanie kontrolki względem powierzchni ≥3:1 |
| Składnia JS | PASS `node --check` |
| Niezależny review kodu | Wykonany; wykryte problemy hover, fokusu i live regionu poprawiono, testy jednostkowe uruchomiono ponownie |

**Te wyniki nie oznaczają certyfikacji WCAG ani wykonania testów przeglądarkowych.** Atrapy DOM nie sprawdzają renderowania, realnego fokusu, prawdziwego schowka, instalacji PWA ani Service Workera.

## Testy niewykonane — warunki przed publikacją

Lokalne środowisko zawiera Playwright, ale nie zawiera przeglądarki. Próba pobrania Chromium zwróciła nieprawidłowe archiwum; uruchomienie testu kończy się `Executable doesn't exist`. Nie oznaczono tego jako testu aplikacji zakończonego sukcesem.

- Macierz 320, 375, 390, 430, 768, 1024 i 1440 px, oba motywy: niewykonana w przeglądarce.
- Realne kopiowanie, odtworzenie ulubionych po reloadzie, rozwijanie kategorii i brak błędów konsoli: niewykonane w przeglądarce.
- Offline po pierwszym pobraniu, instalacja PWA, przejście starej wersji do nowej: niewykonane.
- Chrome Android, Safari iPhone, klawiatura ekranowa i safe areas: niewykonane.
- Klawiatura, czytnik ekranu, zoom 200%/400%, focus niezasłonięty przez sticky: niewykonane.
- Pomiar czasu renderowania, Web Vitals, test na średniej klasy telefonie: niewykonane.
- Automatyczny pełny audyt accessibility: niewykonany.

`tests/browser.cjs` przygotowuje lokalny serwer pod `/kody-skierowan/` z wstrzyknięciem metadanych jak w Pages. Testuje 7 szerokości × 2 motywy, overflow, wymiary akcji, schowek, ulubione po reloadzie, uwagi, paginację, kategorie, offline, błąd danych i zewnętrzne żądania; zapisuje zrzuty. Skrypt ma sprawdzoną składnię, ale **jego scenariusze nie zostały uruchomione**. Pozostałe wymienione wyżej testy wymagają osobnej kontroli.

## Podgląd i uruchomienie

1. Do szybkiego porównania otwórz `review/porownanie.html`. To statyczne, samowystarczalne widoki wykonane z rzeczywistego HTML/CSS obu wersji i tego samego wyniku 88.713. Można wybrać szerokość i motyw; szerokość może być ograniczona rozmiarem okna. To nie screenshoty ani działająca wyszukiwarka.
2. Do testowania aplikacji umieść katalog projektu pod nazwą `kody-skierowan` i uruchom w katalogu nadrzędnym:

```sh
python3 -m http.server 8000
```

Otwórz `http://localhost:8000/kody-skierowan/`. Nie otwieraj `index.html` przez `file://`, ponieważ fetch i PWA wymagają właściwego originu. Surowy `index.html` ma puste metadane, tak jak oryginał; daty kontrolne wstrzykuje workflow. Test przeglądarkowy odtwarza to wstrzyknięcie.

Testy niezależne od przeglądarki, z katalogu projektu:

```sh
node tests/search-reference.cjs
node tests/ui-unit.cjs
python3 tests/verify.py
node --check app.js
```

Opcjonalne testy przeglądarkowe wymagają Node, pakietu `playwright` i zainstalowanej przeglądarki Chromium. Playwright jest narzędziem deweloperskim, nie zależnością aplikacji i nie powinien trafiać do `_site`.

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
node tests/browser.cjs
```

## Wdrożenie do istniejącego repozytorium

Preferuj poprawkę `review/clinical-minimal.patch`, zamiast zastępować całe aktualne repozytorium plikami z ZIP. Poprawka nie zmienia słowników ani metadanych. Jeśli aktualny kod różni się od przesłanej bazy, rozwiąż konflikty na gałęzi i powtórz testy.

```sh
git switch -c redesign/clinical-minimal
git apply --check /sciezka/do/clinical-minimal.patch
git apply /sciezka/do/clinical-minimal.patch
```

`review/clinical-minimal.bundle` zawiera lokalną historię od przesłanej bazy i gałąź redesignu. Nie jest historią aktualnego zdalnego repozytorium. Służy do niezależnego przeglądu, nie do bezpośredniego scalania niepowiązanej historii.

Przed publikacją: wykonaj zaległe testy, sprawdź istniejące ulubione, pełny reload online i ponowne otwarcie offline, oraz przejście starego cache po przerwanym połączeniu. Dopiero potem zatwierdź PR/scalenie. Workflow publikuje zmiany na `main`, więc samo scalenie jest działaniem produkcyjnym.

## Ograniczenia i ryzyka zachowane z bazy

- Mechanizmu aktualizacji nie przebudowano. SW nadal używa wspólnego `icd9-shell`, strategii network-first i dotychczasowej obsługi błędów precache. Nie ma gwarancji atomowego przełączenia wszystkich plików przy przerwanym pobieraniu.
- Zachowano komunikat o aktualizacji słownika. Nie dodano osobnego mechanizmu „nowa wersja interfejsu”, ponieważ wymagałby zmiany cyklu aktualizacji, wskazanej w briefie jako wymagająca osobnej akceptacji.
- Nie weryfikowano na nowo poprawności prawa lub danych medycznych — zachowano przekazane źródła i treść.
- Wielkość HTML+JS+CSS wzrosła o około 2,5 KB przed kompresją; słownik ~939 KB i tabela resortowa pozostały niezmienione. Dokładne wielkości końcowe zapisano w `review/rozmiary.json`. To porównanie bajtów, nie pomiar wydajności.

## Następne usprawnienia

Priorytetem jest ukończenie testów mobilnych i PWA, nie dodawanie funkcji. Oddzielnie można rozważyć atomowe wersjonowanie app shell oraz komunikat nowej wersji aplikacji — po zatwierdzeniu konkretnego rozwiązania. Rozbudowa produktu, nowe zbiory kodów, analityka i konta pozostają poza zakresem.
