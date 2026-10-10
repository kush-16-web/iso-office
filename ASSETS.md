# Asset provenance

| Asset | Source | Usage / licensing status |
| --- | --- | --- |
| `docs/references/master-office.png` | User-supplied master concept image | Design reference only; not loaded by the application. No claim that its depicted stock photographs or 3D models are independently licensed. |
| `docs/references/interaction-guide.png` | User-supplied interaction guide | Design reference only; not loaded by the application. |
| `src/components/Avatar.tsx` | Original inline SVG artwork authored in this implementation | Local illustrated portraits; no third-party photo service, stock image, or downloaded character asset. Deliberate fidelity difference from the reference's photographic call tiles. |
| `public/demo/workspace-layout.svg` | Original SVG layout illustration authored in this implementation | A real, downloadable sample attachment. It is not used as the 3D office background. |
| `public/demo/build-v1.2.3.txt` | Original sample text | A real, downloadable demo file; no fake executable/archive or fabricated file size. |
| 3D scene geometry | Existing repository prototype, refactored in Pass 1 | Three.js-generated floors, desks, meeting tables, shelves, glass partition, and prototype characters. No new third-party model packages. |
| UI icons | Existing `lucide-react` dependency | ISC license; see its installed package license. |

The original unused starter assets remain in the repository. Pass 1 does not introduce new downloaded photographs, textures, fonts, or GLB files. Before Pass 2 imports third-party office or character models, record their source URLs, author, exact license, attribution requirements, and any commercial-use limitations here.
