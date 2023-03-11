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

