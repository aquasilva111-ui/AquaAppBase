# AQUA

Produto: plataforma social modular. Mantra: **Aqua stores relationships, not possessions.**

## Arquitectura (decidida)

O produto **não** nasce desta maquete Grok. Nasce de um **fork de** [bluesky-social/social-app](https://github.com/bluesky-social/social-app).

- Dia 1: AQUA é cliente AT Protocol. Login com conta Bluesky. Sem PDS próprio.
- Fase 2: PDS / host próprio via `ServerInput` já existente — não um segundo login.
- Tab bar: Home · Search · + · Chat · Profile. Books / Wiki / Marketplace **não** vão para a tab bar.
- Módulos AQUA vivem em `src/aqua/` no fork, com placeholders honestos.
- Feed denso (como o Bluesky). Glass e oceano no **shell**, não em cada post.
- Não copiar `assets/icons/` nem `assets/illustrations/` (não são MIT). Ler `ASSETS.md`.

Guia completo: `artifacts/AQUA-BLUESKY-FORK-GUIDE.md`.

PRs no fork, por ordem: config → assets → strings → paleta → drawer → Books.

## Esta sandbox

Estudo visual apenas. Não substituir o social-app por este React. Quando o utilizador mandar o URL do GitHub, o trabalho passa a ser patch no repo real.

## Honestidade

Não fingir APIs Instagram/TikTok, checkout único multilojas, certificação científica, ou ads manager pronto.
