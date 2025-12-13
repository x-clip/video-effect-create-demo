const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// 封装异步方法（避免回调地狱）
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const copyFile = promisify(fs.copyFile);

/**
 * 将指定目录下的 .js 文件复制并改后缀为 .txt
 * @param {string} targetDir - 目标目录路径（绝对/相对路径均可）
 */
async function copyJsToTxt(targetDir) {
  try {
    // 1. 验证目录是否存在
    const dirStat = await stat(targetDir);
    if (!dirStat.isDirectory()) {
      throw new Error(`路径 ${targetDir} 不是有效目录`);
    }

    // 2. 读取目录下所有文件/文件夹
    const files = await readdir(targetDir);

    // 3. 遍历处理每个文件
    for (const file of files) {
      // 拼接文件完整路径
      const filePath = path.join(targetDir, file);
      const fileStat = await stat(filePath);

      // 跳过子目录（只处理文件）
      if (fileStat.isDirectory()) {
        console.log(`跳过目录: ${filePath}`);
        continue;
      }

      // 4. 筛选 .js 后缀的文件
      const ext = path.extname(file);
      if (ext.toLowerCase() === '.js') {
        // 生成新文件名（替换后缀为 .txt）
        const fileName = path.basename(file, ext);
        const newFilePath = path.join(targetDir, `${fileName}.txt`);

        // 5. 复制文件并修改后缀
        await copyFile(filePath, newFilePath);
        console.log(`成功复制: ${filePath} -> ${newFilePath}`);
      }
    }

    console.log('\n所有 .js 文件处理完成！');
  } catch (err) {
    console.error('处理过程中出错:', err.message);
  }
}

// ==================== 使用示例 ====================
// 替换为你要处理的目录路径（相对/绝对路径均可）
const targetDirectory = './public/assets/effectcanvas'; // 示例：当前目录下的 test 文件夹
// 执行函数
copyJsToTxt(targetDirectory);
