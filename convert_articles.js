import fs from 'fs';
import path from 'path';

const sourceDir = 'E:\\Documents\\笔记\\推文';
const postsDir = 'E:\\Development\\Project\\GitHubStar\\dreambo-blog\\pages\\posts';

// 二级分类 -> 文章落地目录
const dirOfCategory = {
  'AI 模型与动态': 'ai/models',
  'AI Agent': 'ai/agent',
  'AI 工具与框架': 'ai/tools',
  '开发工具 工具推荐': 'devtools',
  '开发工具 运维排障': 'devtools',
  '开发实践 后端': 'dev-practice',
  '开发实践 移动端': 'dev-practice',
  '开发实践 工程效率': 'dev-practice',
};

const targetDirOf = (categories) => path.join(postsDir, dirOfCategory[categories] ?? 'ai/tools');

// 读取源目录中的所有 .md 文件
const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.md'));

console.log(`找到 ${files.length} 个文件需要转换\n`);

files.forEach(file => {
  const sourcePath = path.join(sourceDir, file);

  // 读取文件内容
  const content = fs.readFileSync(sourcePath, 'utf-8');

  // 获取文件的最后修改时间
  const stats = fs.statSync(sourcePath);
  const lastModified = stats.mtime;

  // 格式化日期为 YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const dateStr = formatDate(lastModified);

  // 从文件名提取标题（去掉 .md 扩展名）
  const title = file.replace('.md', '');

  // 检查文件是否已经有 frontmatter
  const hasFrontmatter = content.startsWith('---');

  if (hasFrontmatter) {
    console.log(`⏭️  跳过 ${file} (已有 frontmatter)`);
    return;
  }

  // 按标题关键词套用新分类体系（兜底：AI 工具与框架）
  let categories = 'AI 工具与框架';
  let tags = ['AI'];

  const titleRules = [
    [/(fnm|mise|yazi|Easydict|docker|ubuntu)/i, '开发工具 工具推荐', '工具'],
    [/(Loki|日志排障|运维)/i, '开发工具 运维排障', '日志'],
    [/(登录鉴权|Cookie|Session|JWT|SSO)/i, '开发实践 后端', '后端'],
    [/(Shopify|React Native|RN 回原生|移动端)/i, '开发实践 移动端', '移动端'],
    [/(Agent|computer-use|MCP|多智能体|开发板)/i, 'AI Agent', 'Agent'],
    [/(DeepSeek-V|GPT-?\d|跑分|评测|Anthropic|OpenAI)/i, 'AI 模型与动态', '模型'],
  ];
  for (const [re, cat, tag] of titleRules) {
    if (re.test(title)) {
      categories = cat;
      tags = [tag];
      break;
    }
  }

  // 根据文件名关键词调整分类和标签
  if (title.includes('Claude') || title.includes('Anthropic')) {
    tags.push('Claude');
  }
  if (title.includes('DeepSeek')) {
    tags.push('DeepSeek');
  }
  if (title.includes('GPT') || title.includes('OpenAI')) {
    tags.push('OpenAI');
  }
  if (title.includes('Agent')) {
    tags.push('Agent');
  }
  if (title.includes('插件') || title.includes('plugin')) {
    tags.push('插件');
  }
  if (title.includes('开发')) {
    tags.push('开发');
  }

  // 去重标签
  tags = [...new Set(tags)];

  // 构建 frontmatter
  const frontmatter = `---
title: ${title}
date: ${dateStr}
updated: ${dateStr}
categories: ${categories}
tags:
${tags.map(tag => `  - ${tag}`).join('\n')}
---
`;

  // 组合新内容
  const newContent = frontmatter + content;

  // 写入目标文件（按分类落到对应目录）
  const targetDir = targetDirOf(categories);
  fs.mkdirSync(targetDir, { recursive: true });
  const targetPath = path.join(targetDir, file);
  fs.writeFileSync(targetPath, newContent, 'utf-8');
  console.log(`✅ 已转换: ${file}`);
});

console.log(`\n🎉 转换完成! 共处理 ${files.length} 个文件`);
console.log(`目标根目录: ${postsDir}`);
