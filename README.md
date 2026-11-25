# Download Real Python Tutorial Source Code

This service, adapted from [DownGit](https://minhaskamal.github.io/DownGit), allows you to download zipped folders from [Real Python's materials](https://github.com/realpython/materials) GitHub repository.

The source code accompanies code tutorials on [Real Python](https://realpython.com/) and [RealJS](https://realjs.com/).

### Brands

The page brands itself from the GitHub account in the `url` parameter: a `github.com/realjs/...` link gets the RealJS logo, colors and links, anything else gets Real Python's. The brands live in `src/brands.js` and `site.css` (`:root[data-brand=...]`), with RealJS's assets in `assets/realjs/`. To add a brand, add an entry keyed by its GitHub account to both.

### License
<a rel="license" href="https://opensource.org/licenses/MIT"><img alt="MIT License" src="https://cloud.githubusercontent.com/assets/5456665/18950087/fbe0681a-865f-11e6-9552-e59d038d5913.png" width="60em" height=auto/></a><br/><a href="https://github.com/MinhasKamal/DownGit">DownGit</a> is licensed under <a rel="license" href="https://opensource.org/licenses/MIT">MIT License</a>.
