./install.sh

cd dist

git init
git remote add origin git@github.com:TobiasWooldridge/Signage2.git
git add .
git commit -am "Automated distribution build"
git branch gh-pages
git push origin gh-pages --force
