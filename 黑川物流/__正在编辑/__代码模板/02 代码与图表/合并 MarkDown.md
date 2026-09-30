# macOS

## Terminal

~~~
find . -name "*.md" -type f -print0 | sort -z | while IFS= read -r -d '' file; do cat "$file"; printf '\n\n\n'; done > ../merged.md
~~~

# Windows

## PowerShell

~~~
Get-ChildItem -Path . -Recurse -Filter "*.md" -File | Sort-Object FullName | ForEach-Object { 
    Get-Content $_.FullName
    ""
    ""
    ""
} | Out-File -FilePath "merged.md" -Encoding utf8
~~~