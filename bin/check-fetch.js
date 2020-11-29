#!/usr/bin/env node
const path = require('path');
const ora = require('ora');
const fs = require('fs-extra');
const request = require('request'); //request库进行文件下载，简化操作步骤。
const { exit } = require('process');
const inquirer = require('inquirer');
const { parseCmdParams, statusLog } = require('../lib/utils');
const { InquirerOpts, RepoLisPath } = require('../lib/config');
const InitCommand = require('./init-commands.js');
const spinner = ora()

// 生成目标文件夹的绝对路径
function targetRelPath (relPath = 'react-web-template') {
  return path.resolve(process.cwd(), relPath);
}

// 选择模版
function selectedTempl(repos, cmdp) {
  spinner.start('正在拉取项目模板列表...');
  request(RepoLisPath, function (error, response, body) {
    if (error) {
      statusLog.error(`模板列表拉取失败:  ${error}`)
    }
    if (response && response.statusCode === 200) {
      // console.log('body:', body);
      spinner.succeed('模板列表已拉取完成！');
      const tempLists = JSON.parse(body); //回调uri返回的数据
      const choices = tempLists.map(template => {
        return {
          // name: `${template.name} - ${template.description}`,
          // value: template.name,
          name: template.gitname,
          value: {
            url: template.url,
            gitName: template.gitname,
            tmplName: template.tmplname
          }
        };
      });

      const tmplTypeList = [
        {
          type: 'list',
          // name: 'template',
          name: 'type',
          message: '请选择拉取的模版类型:',
          choices
        },
      ]
      
      // 询问选择模版类型
      inquirer.prompt(tmplTypeList).then(answer => {
        const {url, gitName, tmplName} = answer.type;
        console.log("您选择的模版类型是：" + tmplName);
        console.log('项目模版初始化中...');
        if(!url){
          statusLog.error(`${tmplName} 该类型暂不支持...`)
          exit(1);
        }
        
        const RepoMaps = {
          repo: url,
          temp: targetRelPath(gitName),
          ...repos
        }
        new InitCommand(RepoMaps, cmdp)
      })
    }
  });
}

// 检验输入是否重名
async function isExistReName() {
  const { inputNewName } = await inquirer.prompt(InquirerOpts.rename);
  let isExists = fs.existsSync(inputNewName);
  if (isExists) {
    statusLog.error(`The ${inputNewName} project already exists in  directory, Please try to use another projectName!`);
    await isExistReName()
  }
  return { inputNewName }
}

/**
 * 项目文件夹核验和项目模版列表获取
 *
 * @param {} name 用户提供的项目文件夹名称
 * @param {} cmd 用户输入的init命令的参数
 */
exports.CheckFetch = async function(name, cmd, ops = {}) {
  const RepoMaps = {
    projdir: name,
    projpath: targetRelPath(name),
    ...ops
  }
  const cmdParams = parseCmdParams(cmd)

  // 监测文件夹是否存在
  // 如果init附加了--force或-f参数，则直接执行覆盖操作
  if (cmdParams.force) {
    // 移除需要覆盖的文件
    await fs.removeSync(RepoMaps.projpath)
  }
  // 否则进行文件夹检查,  fs.pathExistsSync 判断当前文件夹名称是否已经存在
  const isTarget = await fs.pathExistsSync(RepoMaps.projpath)
  if (isTarget) {
    const { recover } = await inquirer.prompt(InquirerOpts.folderExist);
    if (recover === 'cover') {
      await fs.removeSync(RepoMaps.projpath);
    } else if (recover === 'newFolder') {
      const { inputNewName } = await isExistReName()
      // const { inputNewName } = await inquirer.prompt(InquirerOpts.rename);
      // let isExists = fs.existsSync(inputNewName);
      // if (isExists) {
      //   statusLog.error(`The ${inputNewName} project already exists in  directory, Please try to use another projectName!`);
      //   exit(1);
      // }
      RepoMaps.projdir = inputNewName;
      RepoMaps.projpath = targetRelPath(`./${inputNewName}`);
    } else {
      exit(1);
    }
  }
  selectedTempl(RepoMaps, cmdParams);
}
