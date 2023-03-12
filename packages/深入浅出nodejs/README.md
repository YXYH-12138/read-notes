# Node的应用场景

> [CPU密集型和IO密集型](https://zhuanlan.zhihu.com/p/488951330?utm_id=0)。Node擅长I/O密集型的应用场景

Node面向网络且擅长并行I/O，能够有效地组织起更多的硬件资源，从而提供更多好的服务

**CPU密集型**

CPU密集型也叫计算密集型，指的是系统的硬盘、内存性能相对CPU要好很多，此时，系统运作CPU读写IO(硬盘/内存)时，IO可以在很短的时间内完成，而CPU还有许多运算要处理，因此，CPU负载很高。
CPU密集表示该任务需要大量的运算，而没有阻塞，CPU一直全速运行。CPU密集任务只有在真正的多核CPU上才可能得到加速（通过多线程），而在单核CPU上，无论你开几个模拟的多线程该任务都不可能得到加速，因为CPU总的运算能力就只有这么多。
CPU使用率较高（例如:计算圆周率、对视频进行高清解码、矩阵运算等情况）的情况下，通常，线程数只需要设置为CPU核心数的线程个数就可以了。 这一情况多出现在一些业务复杂的计算和逻辑处理过程中。比如说，现在的一些机器学习和深度学习的模型训练和推理任务，包含了大量的矩阵运算。

**IO密集型**

IO密集型指的是系统的CPU性能相对硬盘、内存要好很多，此时，系统运作，大部分的状况是CPU在等IO (硬盘/内存) 的读写操作，因此，CPU负载并不高。
密集型的程序一般在达到性能极限时，CPU占用率仍然较低。这可能是因为任务本身需要大量I/O操作，而程序的逻辑做得不是很好，没有充分利用处理器能力。
CPU 使用率较低，程序中会存在大量的 I/O 操作占用时间，导致线程空余时间很多，通常就需要开CPU核心数数倍的线程。

Nodejs是单线程，使用事件驱动

# CommonJS规范

CommonJS对模块的定义十分简单，主要分为模块引用、模块定义和模块标识3个部分。

- 模块引用 require()

- 模块定义

  exports对象用于导出当前模块的方法或者变量，并且它是唯一导出的出口。在模块中，还存在一个module对象，它代表模块自身，而exports是module的属性

- 模块标识其实就是传递给require()方法的参数

# Node的模块

> Node对引入过的模块都会进行缓存，以减少二次引入时的开销。不同的地方在于，浏览器仅仅缓存文件，而Node缓存的是编译和执行之后的对象

在Node中引入模块，需要经历如下3个步骤：

1. 路径分析
2. 文件定位
3. 编译执行

在Node中，模块分为两类：一类是Node提供的模块，称为**`核心模块`**；另一类是用户编写的模块，称为**`文件模块`**

❑ 核心模块部分在Node源代码的编译过程中，编译进了二进制执行文件。在Node进程启动时，部分核心模块就被直接加载进内存中，所以这部分核心模块引入时，文件定位和编译执行这两个步骤可以省略掉，并且在路径分析中优先判断，所以它的加载速度是最快的。

❑ 文件模块则是在**运行时动态加载**，需要完整的路径分析、文件定位、编译执行过程，速度比核心模块慢。

核心模块中有一部分是全部由C/C++编写，称为**内建模块**

## 文件模块分类

- ．或．．开始的相对路径文件模块。

- 以/开始的绝对路径文件模块。

- 非路径形式的文件模块，如自定义的connect模块。

## 路径形式的文件模块

以．、.．和/开始的标识符，这里都被当做文件模块来处理。在分析文件模块时，require()方法会将路径转为真实路径，并以真实路径作为索引，将编译执行后的结果存放到缓存中，以使二次加载时更快。

由于文件模块给Node指明了确切的文件位置，所以在查找过程中可以节约大量时间，其加载速度慢于核心模块。

## 自定义模块的查找规则

> [加载流程图](https://www.processon.com/diagraming/640c9816a8175d04f4b38137)

1. 一直从本级目录的node_modules查找到根目录的node_modules

```js
// module.paths 输出
[
  'd:\\AProject\\read-notes\\packages\\深入浅出nodejs\\node_modules',
  'd:\\AProject\\read-notes\\packages\\node_modules',
  'd:\\AProject\\read-notes\\node_modules',
  'd:\\AProject\\node_modules',
  'd:\\node_modules'
]
```

**文件扩展名分析**

require()在分析标识符的过程中，会出现标识符中不包含文件扩展名的情况。CommonJS模块规范也允许在标识符中不包含文件扩展名，这种情况下，Node会按．js、.json、.node的次序补足扩展名，依次尝试。

2. 找到package.json文件，如果有则取出main属性指定的文件名进行定位，而如果main属性指定的文件名错误，或者压根没有package.json文件，Node会将index当做默认文件名，然后依次查找index.js、index.json、index.node。

3. 如果在目录分析的过程中没有定位成功任何文件，则自定义模块进入下一个模块路径进行查找。如果模块路径数组都被遍历完毕，依然没有查找到目标文件，则会抛出查找失败的异常。

## 模块编译

> 在Node中，每个文件模块都是一个对象，它的定义如下：

```js
function Module(id, parent) {
    this.id = id;
    this.exports = {};
    this.parent = parent;
    if (parent && parent.children) {
        parent.children.push(this);
    }

    this.filename = null;
    this.loaded = false;
    this.children = [];
}
```

每一个编译成功的模块都会将其文件路径作为索引缓存在Module._cache对象上，以提高二次引入的性能

JavaScript核心模块的定义如下面的代码所示，源文件通过**process.binding('natives')**取出，编译成功的模块缓存到NativeModule._cache对象上

```js
function NativeModule(id) {
    this.filename = id + '.js';
    this.id = id;
    this.exports = {};
    this.loaded = false;
}
NativeModule._source = process.binding('natives');
NativeModule._cache = {};
```

**根据不同的文件扩展名，Node会调用不同的读取方式**

❑ .js文件。通过fs模块同步读取文件后编译执行。

❑ .node文件。这是用C/C++编写的扩展文件，通过dlopen()方法加载最后编译生成的文件。

❑ .json文件。通过fs模块同步读取文件后，用JSON.parse()解析返回结果。

❑ 其余扩展名文件。它们都被当做．js文件载入。

```js
// Native extension for .json
Module._extensions['.json'] = function(module, filename) {
    var content = NativeModule.require('fs').readFileSync(filename, 'utf8');
    try {
        module.exports = JSON.parse(stripBOM(content));
    } catch (err) {
        err.message = filename + ': ' + err.message;
        throw err;
    }
};
```

**在编译的过程中，Node对获取的JavaScript文件内容进行了头尾包装**

```js
(function (exports, require, module, __filename, __dirname) {
    var math = require('math');
    exports.area = function (radius) {
        return Math.PI * radius * radius;
    };
});
```

## 核心模块引入流程

![os-native-require](https://cdn.staticaly.com/gh/YXYH-12138/yhcdn@main/read-notes/os-native-require.4qqmr25147m0.webp)

# 包结构

完全符合CommonJS规范的包目录应该包含如下这些文件。

❑ package.json：包描述文件。

❑ bin：用于存放可执行二进制文件的目录。

❑ lib：用于存放JavaScript代码的目录。

❑ doc：用于存放文档的目录。

❑ test：用于存放单元测试用例的代码。

**package.json文件定义了如下一些字段**

❑ name。包名。规范定义它需要由小写的字母和数字组成，可以包含．、_和-，但不允许出现空格。包名必须是唯一的，以免对外公布时产生重名冲突的误解。除此之外，NPM还建议不要在包名中附带上node或js来重复标识它是JavaScript或Node模块。

❑ description。包简介。

❑ version。版本号。一个语义化的版本号，这在http://semver.org/上有详细定义，通常为major.minor.revision格式。该版本号十分重要，常常用于一些版本控制的场合。

❑ keywords。关键词数组，NPM中主要用来做分类搜索。一个好的关键词数组有利于用户快速找到你编写的包。

❑ maintainers。包维护者列表。每个维护者由name、email和web这3个属性组成。示例如下："maintainers": [{ "name": "Jackson Tian", "email": "shyvo1987@gmail.com", "web":"http://html5ify.com" }]

❑ contributors。贡献者列表。在开源社区中，为开源项目提供代码是经常出现的事情，如果名字能出现在知名项目的contributors列表中，是一件比较有荣誉感的事。列表中的第一个贡献应当是包的作者本人。它的格式与维护者列表相同。

❑ bugs。一个可以反馈bug的网页地址或邮件地址。

❑ licenses。当前包所使用的许可证列表，表示这个包可以在哪些许可证下使用。

❑ homepage。当前包的网站地址。

❑ repositories。托管源代码的位置列表，表明可以通过哪些方式和地址访问包的源代码。❑ dependencies。使用当前包所需要依赖的包列表。这个属性十分重要，NPM会通过这个属性帮助自动加载依赖的包。

❑ os。操作系统支持列表。这些操作系统的取值包括aix、freebsd、linux、macos、solaris、vxworks、windows。如果设置了列表为空，则不对操作系统做任何假设。

❑ cpu。CPU架构的支持列表，有效的架构名称有arm、mips、ppc、sparc、x86和x86_64。同os一样，如果列表为空，则不对CPU架构做任何假设。

❑ engine。支持的JavaScript引擎列表，有效的引擎取值包括ejs、flusspferd、gpsee、jsc、spidermonkey、narwhal、node和v8。

❑ builtin。标志当前包是否是内建在底层系统的标准组件。

❑ directories。包目录说明。

❑ implements。实现规范的列表。标志当前包实现了CommonJS的哪些规范。

❑ scripts。脚本说明对象

**在包描述文件的规范中，NPM实际需要的字段主要有name、version、description、keywords、repositories、author、bin、main、scripts、engines、dependencies、devDependencies。与包规范的区别在于多了author、bin、main和devDependencies这4个字段。**

❑ author。包作者。

❑ bin。一些包作者希望包可以作为命令行工具使用。配置好bin字段后，通过npm install package_name -g命令可以将脚本添加到执行路径中，之后可以在命令行中直接执行。前面的node-gyp即是这样安装的。通过-g命令安装的模块包称为全局模式。

❑ main。模块引入方法require()在引入包时，会优先检查这个字段，并将其作为包中其余模块的入口。如果不存在这个字段，require()方法会查找包目录下的index.js、index.node、index.json文件作为默认入口。

❑ devDependencies。一些模块只在开发时需要依赖。

##  NPM钩子命令

```json
"scripts": {
    "preinstall": "preinstall.js",
    "install": "install.js",
    "uninstall": "uninstall.js",
    "test": "test.js"
}
```

# 异步IO

操作系统内核对于I/O只有两种方式：阻塞与非阻塞。

应用程序如果需要进行I/O调用，需要先打开文件描述符，然后再根据文件描述符去实现文件的数据读写。此处非阻塞I/O与阻塞I/O的区别在于**阻塞I/O完成整个获取数据的过程**，而**非阻塞I/O则不带数据直接返回，要获取数据，还需要通过文件描述符再次读取。**

- 在调用阻塞I/O时，应用程序需要等待I/O完成才返回结果。阻塞I/O造成CPU等待I/O，浪费等待时间，CPU的处理能力不能得到充分利用
- 非阻塞I/O返回之后，CPU的时间片可以用来处理其他事务。由于完整的I/O并没有完成，立即返回的并不是业务层期望的数据，而仅仅是当前调用的状态。为了获取完整的数据，应用程序需要重复调用(**轮询**)I/O操作来确认是否完成。

由于Windows平台和*nix平台的差异，Node提供了**libuv作为抽象封装层**，使得所有平台兼容性的判断都由这一层来完成，并保证上层的Node与下层的自定义线程池及IOCP之间各自独立。Node在编译期间会判断平台条件，选择性编译unix目录或是win目录下的源文件到目标程序中

![libuv](https://cdn.staticaly.com/gh/YXYH-12138/yhcdn@main/read-notes/libuv.452zs8at1fi0.webp)

## Node非I/O的异步API

它们分别是setTimeout()、setInterval()、setImmediate()和process.nextTick()。

- setTimeout()和setInterval()与浏览器中的API是一致的，分别用于单次和多次定时执行任务。它们的实现原理与异步I/O比较类似，只是不需要I/O线程池的参与。调用setTimeout()或者setInterval()创建的定时器会被插入到定时器观察者内部的一个红黑树中。每次Tick执行时，会从该红黑树中迭代取出定时器对象，检查是否超过定时时间，如果超过，就形成一个事件，它的回调函数将立即执行。

![setTimeout的行为](https://cdn.staticaly.com/gh/YXYH-12138/yhcdn@main/read-notes/setTimeout的行为.4ssvgiblgzg0.webp)

- process.nextTick()方法，只会将回调函数放入队列中，在下一轮Tick时取出执行。定时器中采用红黑树的操作时间复杂度为O(lg(n)),nextTick()的时间复杂度为O(1)。相较之下，process.nextTick()更高效。

- setImmediate()方法与process.nextTick()方法十分类似，都是将回调函数延迟执行

process.nextTick()中的回调函数执行的优先级要高于setImmediate()。这里的原因在于事件循环对观察者的检查是有先后顺序的，process.nextTick()属于**idle观察者**，setImmediate()属于**check观察者**。在每一个轮循环检查中，idle观察者先于I/O观察者，I/O观察者先于check观察者。

```js
// 加入两个nextTick()的回调函数
process.nextTick(function () {
    console.log('nextTick延迟执行1');
});
process.nextTick(function () {
    console.log('nextTick延迟执行2');
});
// 加入两个setImmediate()的回调函数
setImmediate(function () {
    console.log('setImmediate延迟执行1');
    // 进入下次循环
    process.nextTick(function () {
        console.log(’强势插入’);
    });
});
setImmediate(function () {
    console.log('setImmediate延迟执行2');
});
console.log(’正常执行’);
/*
正常执行
nextTick延迟执行1
nextTick延迟执行2
setImmediate延迟执行1
强势插入
setImmediate延迟执行2
*/
```

# 内存控制

> Node的内存构成主要由通过V8进行分配的部分和Node自行分配的部分。受V8的垃圾回收限制的主要是V8的堆内存

Buffer对象不同于其他对象，它不经过V8的内存分配机制，所以也不会有堆内存的大小限制。

```bash
$ node
> process.memoryUsage();
{ rss: 14958592,
heapTotal: 7195904,
heapUsed: 2821496 }
```

heapTotal和heapUsed是V8的堆内存使用情况，前者是已申请到的堆内存，后者是当前使用的量。

Node在启动时可以传递--max-old-space-size或--max-new-space-size来调整内存限制的大小

```bash
node --max-old-space-size=1700 test.js // 单位为MB
// 或者
node --max-new-space-size=1024 test.js // 单位为KB
```

## V8的垃圾回收机制

> V8的垃圾回收策略主要基于分代式垃圾回收机制

**新生代垃圾回收机制**

在分代的基础上，新生代中的对象主要通过**Scavenge**算法进行垃圾回收。在Scavenge的具体实现中，主要采用了**Cheney**算法，该算法由C. J. Cheney于1970年首次发表在ACM论文上。

Cheney算法是一种采用复制的方式实现的垃圾回收算法。它将堆内存一分为二，每一部分空间称为**semispace**。在这两个semispace空间中，只有一个处于使用中，另一个处于闲置状态。处于使用状态的semispace空间称为**From空间**，处于闲置状态的空间称为**To空间**。当我们分配对象时，先是在From空间中进行分配。当开始进行垃圾回收时，会检查From空间中的存活对象，这些存活对象将被复制到To空间中，而非存活对象占用的空间将会被释放。完成复制后，From空间和To空间的角色发生对换。简而言之，**在垃圾回收的过程中，就是通过将存活对象在两个semispace空间之间进行复制**。

![v8的堆内存](https://cdn.staticaly.com/gh/YXYH-12138/yhcdn@main/read-notes/v8的堆内存.3vcutdtnn340.webp)

当一个对象经过多次复制依然存活时，它将会被认为是生命周期较长的对象。这种较长生命周期的对象随后会被移动到老生代中，采用新的算法进行管理。对象从新生代中移动到老生代中的过程称为**晋升**。

对象晋升的条件主要有两个，一个是对象是否经历过Scavenge回收，一个是To空间的内存占用比超过限制。

- 在默认情况下，V8的对象分配主要集中在From空间中。对象从From空间中复制到To空间时，会检查它的内存地址来判断这个对象是否已经经历过一次Scavenge回收。如果已经经历过了，会将该对象从From空间复制到老生代空间中，如果没有，则复制到To空间中。
- 另一个判断条件是To空间的内存占用比。当要从From空间复制一个对象到To空间时，如果To空间已经使用了超过25%，则这个对象直接晋升到老生代空间中

**老生代垃圾回收机制**

采用了Mark-Sweep和Mark-Compact相结合的方式进行垃圾回收，也就是**标记清除和标记整理**。分为标记和清除两个阶段。

- 在标记阶段遍历堆中的所有对象，并标记活着的对象，在随后的清除阶段中，只清除没有被标记的对象
- 进行一次标记清除回收后，内存空间会出现不连续的状态。这种内存碎片会对后续的内存分配造成问题，因为很可能出现需要分配一个大对象的情况，这时所有的碎片空间都无法完成此次分配，就会提前触发垃圾回收，而这次回收是不必要的。
- 标记整理是在标记清除的基础上演变而来的，对象在标记为死亡后，在整理的过程中，将活着的对象往一端移动，移动完成后，直接清理掉边界外的内存

**GC垃圾回收机制总结**
1、引用计数法。对象每有一个引用计数加1，清除则会减1，为0的对象则会清除。如果存在循环引用则会导致对象无法回收。
2、标记清除。核心思路就是可达性。从根对象查找有引用的对象。没有引用的对象则会被清除。
优化：（1）标记整理。被保留对象会被移动到一段连续的内存空间，避免内存碎片化
（2）分代回收。将内存空间分成两份，新的和老的。每一个新老对象又会分成两份，第一次没被回收的对象先进入到新的第二份对象中，老对象也是如此。连续没有被回收的对象会被移动到老的，减少检测的次数。
（3）增量回收。回收分成多次。避免回收时间过长导致js无法执行
（4）闲时回收。cpu空闲时回收，减少可能对代码执行的影响

