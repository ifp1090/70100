'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generatePDFFromElement, generateDOCXFromMarkdown } from '@/lib/document-generator';
import PagedPreview from '@/components/PagedPreview';

const MDEditor = dynamic(() => import('@uiw/react-md-editor').then(mod => mod.default), {
  ssr: false,
  loading: () => <div className="h-[400px] flex items-center justify-center">加载编辑器中...</div>,
});

export default function Home() {
  const [markdown, setMarkdown] = useState<string>(`# 阿里云@免费证书@申请@SSL@步骤@网站@pbox.online

### 1.购买免费证书

（要看自己还有没有剩余的名额，如果没有的话，需要购买，貌似是按年计算的，每一年似乎都要重新购买）

![image-1](https://pbox.online/202501201046288.png)

已经购买的再次选择这个会有这样的提示：

![image-2](https://pbox.online/202501201048484.png)

刷新后会有如下状态：
![image-3](https://pbox.online/202501201049997.png)

点击上述图表右边的「验证」，会出现验证通过的提示：

![image-4](https://pbox.online/202501201050507.png)

### 2.证书部署

这时候点击右边的「部署」：

![image-5](https://pbox.online/202501201051012.png)

然后在出现的界面直接点「预览并提交」

![image-6](https://pbox.online/202501201052568.png)

会出现一个「提交」的提示，点击即可：

![image-7](https://pbox.online/202501201052917.png)

这时候会出现一个「待部署」的提示：

![image-8](https://pbox.online/202501201053191.png)

等待1分钟，刷新页面，提示「部署成功」：

![image-9](https://pbox.online/202501201054885.png)

### 3.部署验证

回到\`CDN \`-\`证书服务\`页面，可以看到「部署成功」的显示：

![image-10](https://pbox.online/202501201056702.png)

CDN/证书服务的页面：https://cdn.console.aliyun.com/safety/https

---

### 1.3.1 条件概率

$$
\begin{cases}
P(堵车|早晚高峰) = 0.9 \\
P(堵车|中午) = 0.2
\end{cases}
$$

---

### 1.3.2 最大似然估计

$$
\begin{cases}
P(观测的现象|原因1) \\
P(观测的现象|原因2) \\
P(观测的现象|原因3)
\end{cases}
$$

---

| A    | B    | C    |
| ---- | ---- | ---- |
| 12   | 31   | 25   |
| 2    | 3    | 3    |`);

  return (
    <main className="container py-8">
      <Tabs defaultValue="edit">
        <TabsList className="mb-4">
          <TabsTrigger value="edit">编辑</TabsTrigger>
          <TabsTrigger value="preview">预览</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <MDEditor value={markdown} onChange={(val) => setMarkdown(val || '')} height={600} />
        </TabsContent>

        <TabsContent value="preview">
          <div id="pdf-preview">
            <PagedPreview markdown={markdown} />
          </div>

          <div className="mt-4 flex gap-4">
            <Button onClick={() => generatePDFFromElement('pdf-preview')}>
              提交并下载 PDF
            </Button>
            <Button onClick={() => generateDOCXFromMarkdown(markdown)}>
              提交并下载 Word 文档
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
