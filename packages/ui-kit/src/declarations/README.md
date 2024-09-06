# declarations 的作用

declaration 用于存放 xxx.d.ts 文件。

此文件夹的类型声明仅限作用于 ui-kit 包。

请外部使用者不要通过路径导入的方式使用其中的类型。

如果有需要，应当将对应声明放置于贴近组件的 types.ts 文件中。
