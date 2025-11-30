
* [hchalouati](https://github.com/hchalouati)
* [medazizktata25](https://github.com/medazizktata25)
* [YassineCommits](https://github.com/YassineCommits)

```shell
p=1;
while true; do
    s=$(curl "https://api.github.com/repos/Guepard-Corp/qwery-core/contributors?page=$p") || break
    [ "0" = $(echo $s | jq length) ] && break
    echo $s | jq -r '.[] | "* [" + .login + "](" + .html_url + ")"'
    p=$((p+1))
done
```