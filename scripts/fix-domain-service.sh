#!/bin/bash
# 批量修复 DomainService 导入

echo "Fixing DomainService imports..."

# 在 libs/saas-core/src/domain/services 目录下查找所有使用 DomainService 的文件
files=$(grep -rl "from \"@hl8/domain-kernel\"" libs/saas-core/src/domain/services/ | xargs grep -l "DomainService" | grep -v "node_modules")

for file in $files; do
  echo "Processing: $file"
  
  # 替换 DomainService 为 BaseDomainService
  sed -i 's/\bDomainService\b/BaseDomainService/g' "$file"
  
  # 如果文件中有 extends DomainService，需要添加 execute 方法
  if grep -q "extends BaseDomainService" "$file"; then
    echo "  - Already using BaseDomainService"
  fi
done

echo "Done!"
