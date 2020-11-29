module.exports  = {
  InquirerOpts: {
    // 文件夹已存在的询问参数
    folderExist: [{
      type: 'list',
      name: 'recover',
      message: '该文件夹已存在，请选择操作：',
      choices: [
        { name: '创建新的项目文件夹', value: 'newFolder' },
        { name: '覆盖', value: 'cover' },
        { name: '退出', value: 'exit' },
      ]
    }],
    // 重命名的询问参数
    rename: [{
      name: 'inputNewName',
      type: 'input',
      message: '请输入新的项目名称: '
    }],
    // 输入所需分支
    inputBranch: [{
      type: 'input',
      name: 'branch',
      message: '输入你所需的模版分支:',
      default: 'master',
    }]
  },
  // 远程Repo模版列表
  RepoLisPath: 'https://explorer-wu.github.io/cli-configs/explore-cli-template.json' 
}