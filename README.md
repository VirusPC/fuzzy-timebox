## Fuzzy Timebox

[大规模时序数据可视分析系统](https://fuzzy-timebox2.vercel.app/)

- **更丰富&前沿的探索分析能力**。实现了多篇顶会论文提出的Timebox、Augular、RNN、Sketch等时序数据可视查询方法，并引入模糊查询的概念来增强查询的表达力和灵活性。支持比 timebox 更优的 representative lines 的选择
- **更灵活&精准的时序查询系统**。支持 可视查询组件 和 文本查询语法 两种查询系统，前者更加灵活 而 后者更加精准。两个系统进行双向绑定，用户可以充分在两个系统之间穿插定义复杂的组合查询。
- **更快的查询速度和实时交互反馈**。对 line-based-kd-tree （2023， CCF-A）进行了数据结构和算法优化，以支撑各种时序查询能力的加速。数据结构和查询算法支持 内存/服务端，支持精准查询&模糊查询。

![系统概览图](https://github.com/VirusPC/fuzzy-timebox/blob/main/IMG_0240.PNG)
