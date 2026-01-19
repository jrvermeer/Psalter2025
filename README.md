# Psalter2025

deployed via github pages: https://jrvermeer.github.io/Psalter2025/

run `ng deploy --base-href=/Psalter2025/` after pushing to deploy to github pages

VERSION_INSTALLATION_FAILED was due to pre-hashed index.html not matching the deployed hashed index.html, because the pre-hashed one was using \r\n and git was serving it with just \n
