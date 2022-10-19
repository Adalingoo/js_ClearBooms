//面向对象的写法 通过new创建实例

//构造函数 es5的写法
//tr,td,mineNum 用户决定棋盘大小和雷的数量
function Mine(tr,td,mineNum){
    this.tr = tr //行数
    this.td = td //列数
    this.mineNum = mineNum //雷的数量

    this.squares=[] //存储所有方块的信息，是一个二维数组，按行与列的顺序排布。存取都使用行列的形式 [ [],[],……]
    this.tds=[] //存储所有的单元格的dom
    this.surplusMine=mineNum //剩余雷数
    this.allRight=false //右击标记的小红旗对应的方格里都是雷，判断用户是否游戏成功

    this.parent=document.querySelector('.gameBox') //获取父节点
}

//给构造函数里添加方法
//生成n个不重复的数字用于放置雷
Mine.prototype.randomNum=function(){
    //创建一个单元格总数长度的数组
    var square = new Array(this.tr*this.td);
    //为数组里面的每一个元素附上值，此时是顺序排列的784个元素
    for (var i=0;i<square.length;i++){
        square[i]=i
    }
    //让数组乱序排列，function(){return 0.5-Math.random()}返回1或-1，决定数字是不交换还是交换
    square.sort(function(){return 0.5-Math.random()})
    //截取雷数个数组,对应数的格子放置雷
    return square.slice(0,this.mineNum)
}
//初始化操作
Mine.prototype.init=function(){
    //生成随机数
    var rn = this.randomNum() //雷在格子中的位置 一维数组
    var  n =0 //用来找到格子 对应的索引

    //存储方块信息：雷/数字
    for(var i=0;i<this.tr;i++){
        this.squares[i]=[] //二维数组存放信息
        for(var j=0;j<this.td;j++){
            n++ //循环遍历每个格子，此处的n为要遍历格子的索引
            //格子定位：取一个方块在数组里的数据要使用行与列的形式去取。找方块周围的方块通过坐标的形式取。行与列的形式与坐标的形式x,y是相反的
            //行与列 0，0 0，1 0，2
            //坐标 0，0 1，0 2，0
            if(rn.indexOf(n)!=-1){
                //如果rn中 存在n这个值,则此处标记为雷，通过行与列的方式，与坐标相反（x:列 y:行）
                this.squares[i][j]={type:'mine',x:j,y:i}
            }else{
                //反之则为数字，值暂为0
                this.squares[i][j]={type:'number',x:j,y:i,value:0}
            }
        }
    }
    //更新数字
    this.updateNum()
    //创建表格
    this.createDom();
    //阻止右键默认弹出对话框行为(事件委派)
    this.parent.oncontextmenu=function(){
        return false
    }
    //显示剩余雷数
    this.mineNumDom = document.querySelector('.mineNum')
    this.mineNumDom.innerHTML=this.surplusMine

}
//创建表格
Mine.prototype.createDom=function(){
    var table = document.createElement('table')
    var This = this
    for (var i=0;i<this.tr;i++){ //循环行
        var domTr = document.createElement('tr')//创建行
        this.tds[i]=[]//在二维数组里创建[],用来存储单元格信息 [ [],[],[]……]

        for (var j=0;j<this.td;j++){//循环列
            var domTd=document.createElement('td')//创建单元格
            // domTd.innerHTML=0 //文字
             //点击之后才显示
             domTd.pos=[i,j] //把格子对应的行与列存在格子身上，为了下面通过这个值去数组里取到对应的值
             //绑定鼠标事件
             domTd.onmousedown=function(){
                 This.play(event,this) //This指向实例对象，this指的是点击的那个td
             }
            this.tds[i][j]=domTd//把所有创建的td添加到数组中 [[0：domTd],[1：domTd],……]----这里仅是存储，未生成节点

           
            /* //显示雷
            if(this.squares[i][j].type=='mine'){
                //因为在创建表格之前已往squares中添加信息，所以可以直接判断处理，添加雷的样式
                domTd.className='mine'
            }
            //显示数字
            if(this.squares[i][j].type=='number'){
                domTd.innerHTML=this.squares[i][j].value
            } */

            domTr.appendChild(domTd)//添加节点
        }
        table.appendChild(domTr)//添加节点
    }
    //清空前一次的记录
    this.parent.innerHTML=''
    this.parent.append(table)//添加节点
}


//找某个雷方格周围的8个方格:使用坐标（与行列相反）
//原理：以9宫格为单位，中间有多少个雷，则计为几，同时处在旁边的九宫格中则雷数累计（任意格子最多处在9个九宫格中）
Mine.prototype.getAround=function(square){
    //中心点的坐标x:j y:i
    var x = square.x
    var y = square.y
    var result = [] //其余8个方格的坐标（非雷区），是个二维数组
    /* 
    九宫格的坐标
    x-1,y-1    x,y-1   x+1,y-1
    x-1,y      x,y     x+1,y
    x-1,y+1    x,y+1   x+1,y+1
    */
   //通过坐标循环九宫格
   for(var i=x-1;i<=x+1;i++){
    for(var j=y-1;j<=y+1;j++){
        //排除无效的格子坐标
        if(
            i<0 || //格子超出左边的范围
            j<0 || //格子超出上边的范围
            i>this.td-1 || //格子超出右边的范围
            j>this.tr-1 || //格子超出下边的范围
            (i==x && j==y) || //循环到自身的格子
            this.squares[j][i].type=='mine' //循环到的格子是个雷
        ){
            continue
        }
        result.push([j,i])//将格子坐标以行和列的形式返回回去，因为需要通过行列获取数组里的数据
    }
   }
   return result
}
//更新所有的数字:即更改this.squares[][].value
Mine.prototype.updateNum=function(){
    //遍历所有的格子
    for(var i=0;i<this.tr;i++){
        for(var j=0;j<this.td;j++){
            //当中心是数字，则跳出循环
            if(this.squares[i][j].type=='number'){
                continue
            }
            //否则查找雷的周围
            var num = this.getAround(this.squares[i][j])
            /* 
            因为num得到的是一个二维数组
            x,y分别为列行j、i
            取值应当如：num[k]=[x,y]
            x=num[k][0] 
            y=num[k][1]
            更改this.squares[][].value
            */
           for(var k=0;k<num.length;k++){
            //this.squares[i][j]={type:'number',x:j,y:i,value:0}
            this.squares[num[k][0]][num[k][1]].value+=1 //累加
           }
        }
    }
    // console.log(this.squares);
}
//操作游戏
Mine.prototype.play=function(event,obj){
    var This = this
    //点击左键
    if(event.which==1 && obj.className!='flag'){//obj.className!='flag'用来限制标完小红旗后不能再左键点击
        // console.log(obj);//获得点击的td节点
        //显示：数字or雷
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]]
        // console.log(curSquare);//{type: 'number', x: 15, y: 10, value: 2}
        var cl=['zero','one','two','three','four','five','six','seven','eight']
        if(curSquare.type=='number'){
            // console.log('点到数字了');
            obj.innerHTML=curSquare.value
            obj.className=cl[curSquare.value]
            //特殊：如果数字为0，则不显示
            if(curSquare.value==0){
                /* 
                    数字为0，会触发一大片0的显示
                    原理：递归，如果找到属于自己的九宫格都是0，继续向外找，直到找到不是0的停止
                    表述：用户点到0
                        ①显示自己
                        ②找四周
                            Ⅰ显示四周（如果四周的值不为0，那就显示到此 为止，不需要再找了）
                            Ⅱ如果值为0
                                i 显示自己
                                ii 找四周：同上
                
                */
                obj.innerHTML=''//如果是0不显示

                //找周围的0
                function getAllZero(square){
                    var around = This.getAround(square)//找到周围的n个格子,二维数组

                    //循环遍历所有以0为中心的九宫格
                    for(var i=0;i<around.length;i++){
                        //around[i]=[0,0] 以行和列的存储方式
                        var x= around[i][0]//行
                        var y=around[i][1]//列

                        //给对应dom添加样式
                        //因在循环中产生多个单元格,不能再使用之前传入的obj,遂使用tds(存储所有格子的dom)
                        This.tds[x][y].className=cl[This.squares[x][y].value]
                        //如果中心点是0,调用函数（递归：调用自身）
                        if(This.squares[x][y].value==0){
                            //直接调用会造成性能损耗，有些格子会被重复检测
                            if(!This.tds[x][y].check){
                                //给对应的td添加一个属性，这条属性用于决定这个格子有没有被找过。如果被找过，则属性为真，下一次就不找了，节省性能
                                This.tds[x][y].check=true
                                getAllZero(This.squares[x][y])
                            }
                        }else{
                            //如果以某个格子为中心找到的四周格子的值不为0，则将人家的数字显示出来
                            This.tds[x][y].innerHTML=This.squares[x][y].value
                        }
                    }
                }
                //记得调用
                getAllZero(curSquare)
            }
        }else{
            console.log('点到雷了');
            this.gameOver(obj)
            // alert('Game Over!!!')?为什么会提前执行

        }
    }
    //点击右键
    if(event.which==3){
        /* 
            1.标上小红旗
            2.再次 右键取消小红旗
            3.剩余雷数 有flag时--，无flag时++
            4.剩余雷数为0时判断是否所有小红旗都插在雷上，输出成功 或失败
        */
       //当单元格有className且className不为flag时，跳出判断：不能在已出现的数字格上插旗
       if(obj.className && obj.className!='flag'){
        return
       }
       //插入或取消小红旗
       obj.className=obj.className=='flag'? '':'flag'//切换class

       //剩余雷数显示的变化this.surplusMine
       if(obj.className=='flag'){
        this.mineNumDom.innerHTML=--this.surplusMine
       }else{
        this.mineNumDom.innerHTML=++this.surplusMine
       }

       //判断所有小红旗是否都插在雷上
        //循环找到所有雷 判断这些雷是否都有flag
        for(var i=0;i<this.tr;i++){
            for(var j=0;j<this.td;j++){
                if(this.squares[i][j].type=='mine' && this.tds[i][j].className=='flag'){
                    this.allRight=true;
                }else{
                    this.allRight=false
                }
            }
        }

       //当剩余雷数为0时判断结果:此时小红旗全部插完
       if(this.surplusMine==0){
        if(this.allRight){
            alert('恭喜你，游戏通过!!')
        }else{
            //游戏失败，显示所有雷(不用传参，不标红)
            alert('Game Over!!!')
            this.gameOver()
        }
       }
       
    }
}

//游戏失败函数
Mine.prototype.gameOver=function(clickTd){
    /* 
        1.显示所有的雷
        2.取消所有格子的点击事件
        3.给点中的雷标红
    */
   //循环找到所有雷
   for(var i=0;i<this.tr;i++){
    for(var j=0;j<this.td;j++){
        if(this.squares[i][j].type=='mine'){
            //显示所有的雷
            this.tds[i][j].className='mine'
        }
        //取消点击事件
        this.tds[i][j].onmousedown=null
    }
   }
   //点中的雷标红
   if(clickTd){
    clickTd.style.backgroundColor='#f00'
   }
}

//处理4个按钮
var btns = document.querySelectorAll('.level button')
var ln = 0 //用来处理当前选中的状态
var mine = null //用来存储生成的实例
var arr = [[9,9,10],[16,16,40],[28,28,99]] //不同级别的行列及雷数

for(let i=0;i<btns.length-1;i++){
    //添加点击事件
    btns[i].onclick=function(){
        btns[ln].className='';//给选中的按钮清空类名
        this.className='active'//这里的this指向选中的按钮

        //生成不同实例
        mine=new Mine(...arr[i])//...arr[i] 扩展运算符 =arr[i][0],arr[i][1],arr[i][2]
        mine.init()

        ln=i//ln始终是3，这是变量泄漏，需要用let声明
    }
}
btns[0].onclick()//初始化
btns[3].onclick=function(){//重新开始按钮
    mine.init()
}





//实例化
// var mine = new Mine(28,28,99)
// mine.init()
// console.log(mine.getAround(mine.squares[0][0]));