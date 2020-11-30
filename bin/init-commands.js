#!/usr/bin/env node
const path = require('path');
const ora = require('ora');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const download = require('download-git-repo');
const { exit } = require('process');
const { copyFiles, getGitUser, runCmd, statusLog } = require('../lib/utils');
const { InquirerOpts } = require('../lib/config');

/**
 * class 项目初始化命令
 */
class InitCommand {
  constructor(repomaps, cmd) {
    this.cmdParams = cmd
    this.RepoMaps = repomaps
    this.gitUser = {}
    this.spinner = ora()
    this.init()
  }

  // 初始化函数
  async init() {
    try {
      // 拉取git上的项目模板
      await this.downloadRepoTemp();
      // 把下载下来的资源文件，拷贝到目标文件夹
      await this.copyRepoTemp();
      // 根据用户git信息等，修改项目模板中package.json的一些信息
      await this.updatePkgJson();
      // 对我们的项目进行git初始化
      await this.initGit();
      // 最后安装项目依赖包！
      await this.setupDep();
    
    } catch (error) {
      statusLog.error(error);
      exit(1)
    } finally {
      this.spinner.stop();
    }
  }

  // 下载repo资源
  downloadRepoTemp() {
    const { repo, temp } = this.RepoMaps
    return new Promise(async (resolve, reject) => {
      await fs.removeSync(temp);
      // console.log("downloadRepoTemp:", repo, temp);
      // 询问选择下载版本分支
      inquirer.prompt(InquirerOpts.inputBranch).then(answer => {
        this.spinner.start('开始下载项目模板...');
        // download-git-repo: 从仓库下载代码-GitHub，GitLab，Bitbucket
        // repo:模板远程地址	temp: 模版缓存路径 clone:是否采用git clone模板   err：错误信息
        download(`${repo}#${answer.branch}`, temp, {
          clone: false,
        }, async err => {
          this.spinner.stop();
          if (err) {
            return reject(err);
          }
          this.spinner.succeed('模版下载成功');
          return resolve()
        });
      });
    })
  }

  // 拷贝repo资源
  async copyRepoTemp() {
    const { temp, projpath } = this.RepoMaps
    await copyFiles(temp, projpath, ['./git', './changelogs']);
  }

  // 更新package.json文件
  async updatePkgJson() {
    this.spinner.start('正在更新package.json...');
    const pkgPath = path.resolve(this.RepoMaps.projpath, 'package.json');
    const useLessKey = ['keywords', 'license', 'files']
    const { name = '' } = await getGitUser();

    const jsonData = fs.readJsonSync(pkgPath);
    useLessKey.forEach(key => delete jsonData[key]);
    Object.assign(jsonData, {
      name: this.RepoMaps.projdir,
      author: name ? `${name}` : 'explo',
      provide: true,
      version: "1.0.0"
    });
    await fs.writeJsonSync(pkgPath, jsonData, { spaces: '\t' })
    this.spinner.succeed('package.json更新完成！');
  }

  // 初始化git文件
  async initGit() {
    this.spinner.start('正在初始化Git管理项目...');
    await runCmd(`cd ${this.RepoMaps.projpath}`);
    process.chdir(this.RepoMaps.projpath);
    await runCmd(`git init`);
    this.spinner.succeed('Git初始化完成！');
  }

  // 安装依赖
  async setupDep() {
    try {
      this.spinner.start('项目依赖包安装中...');
      await runCmd(`yarn install`);
      // await runCmd(`git add . && git commit -m"init: 初始化项目基本框架"`);
      this.spinner.succeed('依赖包安装完成！');
    } catch (error) {
      console.log('项目依赖包安装失败，请运行如下命令手动安装：\n');
      statusLog.success(` cd ${this.RepoMaps.projdir}`);
      statusLog.success(` yarn install`);
    }
  }
}

module.exports = InitCommand;