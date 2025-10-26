#!/bin/bash
# 批量添加 execute 方法到服务类

echo "Adding execute method to services..."

# 查找需要添加 execute 方法的文件
files=$(pnpm run build 2>&1 | grep "error TS2515" | grep "does not implement" | sed 's/:.*//' | sort -u)

for file in $files; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    
    # 在构造函数后面添加 execute 方法
    # 查找最后一个构造函数或 class 声明
    # 在当前实现中，我们手动添加更安全
    
    echo "  - Need to manually add execute method"
  fi
done

echo "Done!"
