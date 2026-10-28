# your-miro.github.io

Personal portfolio of Marwan Emira — RF · Radar · Electromagnetics.
Plain Jekyll with a hand-written "lab instrument" theme (no gem theme), deployed to GitHub Pages by
`.github/workflows/jekyll.yml` on every push to `main`.

## Run locally

```shell
bundle install
bundle exec jekyll serve      # http://127.0.0.1:4000
```

## Where things live

| What | File |
|---|---|
| Name, tagline, links, résumé toggle | `_config.yml` (`author:`, `resume:`) |
| Home page sections (hero, about, research, contact) | `index.html` |
| Selected-work cards (order, image, readouts) | `_data/projects.yml` |
| Experience timeline | `_data/experience.yml` |
| Toolbox chips | `_data/toolbox.yml` |
| Lab log (all posts, category filters) | `posts.html` |
| Post template (meta strip, TOC, prev/next) | `_layouts/post.html` |
| Styles / theme tokens | `assets/css/main.scss` |
| Spectrum-analyzer hero, theme toggle, TOC | `assets/js/main.js` |

## Writing a post

Add `_posts/YYYY-MM-DD-Slug.md` with the usual front matter (`title`, `date`, `categories`, `tags`,
`description`, optional `image.path`, `math: true` for MathJax). URLs stay `/posts/<Slug>/`.
End with `{% include comment.html %}` for giscus comments. To feature it on the home page, add an
entry to `_data/projects.yml`.

## License

MIT — see `LICENSE`.
