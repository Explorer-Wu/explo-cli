#!/usr/bin/env node
const { Command } = require('commander');
// 导入当前根目录下的package.json文件，获取对应的版本字段值version
const { version } = require('../package.json');
const { CheckFetch } = require('./check-fetch.js');

// 初始化, 创建本地 Command 对象是一种更好的方式
const commander = new Command();

// 定义版本命令和help命令的说明信息
commander
  .version(version, '-v, --version', 'display version for explo-cli')
  .usage('<command> [options]')

// // 定义explo 参数
// commander 
//   .option('-f, --force', 'force all the question')

/**
 * 调用command方法，创建一个init命令,
 * 同时init命令后面必须跟一个命令参数
 * 假如你在终端运行explo init不加项目名称，则会报错提示用户
 */
commander.command('init <projectName>')
  .alias("i")
  // 定义该命令的描述
  .description('请输入项目名称，初始化一个explo项目模版')
  // 为该命令指定一些参数
  .option('-f, --force', '忽略文件夹检查，如果已存在则直接覆盖')
  /**
   * 定义实现逻辑
   * name 表示当前定义的projectName参数
   * cmd 则是终端的cmd对象，可以从中解析到我们需要的内容
   */
  .action((name, cmd) => {
    CheckFetch(name, cmd)
  });

/** 最后解析
 * 注意使用parse()方式, 而不是直接在上面的链式调用之后直接.parse()调用
 * 不然就会作为当前command的parse去处理，从而help命令等都与预期不符
 */
try {
  commander.parse(process.argv);
} catch (err) {
  console.log('err: ', err)
}