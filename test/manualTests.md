If testing on localhost port 5500

http://127.0.0.1:5500/index.html?url=https%3A%2F%2Fgithub.com%2Frealpython%2Fmaterials%2Ftree%2Fmaster%2Fpython-yaml
http://127.0.0.1:5500/index.html?url=https%3A%2F%2Fgithub.com%2Frealpython%2Fmaterials%2Ftree%2F7010df1c142cefe717be3ccb406b914b7cd5677e%2Fweb-scraping-bs4
http://127.0.0.1:5500/index.html?url=https%3A%2F%2Fgithub.com%2Frealpython%2Fmaterials%2Fblob%2Fmaster%2Fpython-eval-mathrepl%2Fmathrepl.py
http://127.0.0.1:5500/index.html?url=https%3A%2F%2Fgithub.com%2Frealpython%2Fmaterials%2Fblob%2Fd10ccf9e4451c1dbe99d9d3d06ea794bcb90188f%2Fpython-eval-mathrepl%2Fmathrepl.py
http://127.0.0.1:5500/index.html?url=https%3A%2F%2Fgithub.com%2Frealpython%2Fdockerizing-django%2Ftree%2Fd3dc0dd9d2450f51c75337083edcdd4597f4ec1d

These types of url should be invalid but the "browse source code" button should redirect to them:

http://127.0.0.1:5500/index.html?url=https%3A%2F%2Fgithub.com%2Frahmonov%2Falcazar
http://127.0.0.1:5500/index.html?url=https%3A%2F%2Fgithub.com%2Frealpython%2Fdockerizing-django%2Farchive%2Fmaster.zip

No 'url' key:
http://127.0.0.1:5500/index.html?https%3A%2F%2Fgithub.com%2Frealpython%2Fmaterials%2Ftree%2Fmaster%2Fpython-yaml

Invalid url:
http://127.0.0.1:5500/index.html?url=htt%2Frealpython%2Fmaterials%2Ftree%2Fmaster%2Fpython-yaml

404:
http://127.0.0.1:5500/index.html?url=https%3A%2F%2Fgithub.com%2FrealpythoONONONn%2Fmaterials%2Ftree%2Fmaster%2Fpython-yaml

These bad links will break the "browse source code" button:

http://127.0.0.1:5500/index.html?url=https%3A%2F%2Fgithub.com%2FrahmoOOOOnov%2Falcazar
http://127.0.0.1:5500/index.html?url=https%3A%2F%2Fgithub.com%2FrealpythOOOOon%2Fdockerizing-django%2Farchive%2Fmaster.zip
