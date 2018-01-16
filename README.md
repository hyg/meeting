# meeting
[项目成员会议：在线议事规则](http://blog.sina.com.cn/s/blog_591ac304010186yg.html)的软件实现。


## 16:30~17:59
meeting

https://github.com/hyg/meeting  
会议的API及代码实现

### API
这套接口只考虑单次会议，会议与成员的关系由共同体模型规定，不考虑会议之间的任务：
* 由召集人选定与会者，与会者自行判断召集人是否合法。
* 不再安排会议合法性的投诉接口
* 不再确认前次会议决议的合法性

如果是保密会议，所有信息使用公钥加密，会议纪要由记录员决定是否发布。

* meeting/motion：提交动议。
* meeting/call：召集通知。
	* motion list：纳入议程的动议清单。
	* 时间
	* 入口url（软件自动生成的可以不操作）
	* open: yes | no
		* no: member list：与会者名单，逐一选定。
	* 保密：yes | no
		* （如果保密的话）列席人员名单
	* 主持人
	* 记录员
* meeting/enter：主持人、记录员、与会者、列席者进入入口时自动发出。
	* member ID
	* enter time
	* sig
* meeting/begin：由主持人决定开会。（考虑各种特殊情况，软件暂不检查时间）
	* meeting/begin/confirm：记录员根据到场人员确认会议合法性。
	* meeting/begin/fail：记录员根据到场人员确认会议无法召开。
* meeting/end：由主持人决定散会。
	* meeting/summary：如果是保密会议，由记录员数字签名并提交，才会发布会议纪要。暂定三分钟超时。
		* meeting ID

* motion/new：临时动议。与会前提交动议不同，需要复述、确认。
	* motion/accept：主持人接受动议，意味着记录员准备复述。
		* motion ID
	* motion/retell：记录员复述动议。
	* motion/confirm：提议人确认复述。
* motion/update：修订动议。
	* motion ID
	* update ID（软件生成）
	* update：...
	* motion/accept：主持人接受动议，意味着记录员准备复述。
		* motion ID
		* update ID
 	* motion/retell：记录员复述动议。
	 	* motion ID
	 	* update ID
	 	* content
	* motion/confirm：提议人确认复述。
		* motion/retell
		* yes | no
			* update if no
* motion/begin：主持人决定开始一个动议。
	* motion ID
* motion/apply：与会者向主持人提出发言。
* motion/member：主持人指定发言人及时间。
	* member ID：
	* time：
* motion/free：自由发言，同一名发言人发言间隔不能少于time。
	* time:
* motion/speak：发言。
* motion/postpone：搁置动议。简化在主持人手中，与会者可在发言事件下提出。
* motion/vote：主持人决定开始表决。
	* motion ID
	* time：不得少于一分钟
* member/vote：与会者提交表决结果。
	* motion ID
	* vote：


### 主持人
* meeting/call  --> meeting/enter --> meeting/begin --> 记录员meeting/begin/confirm --> \*1 motion/begin | meeting/end  --> motion/member | motion/free [--> motion/vote] --> motion/postpone --> \*1 
* 与会者 motion/update | motion/new  --> motion/accept
* 与会者 motion/confirm --> 主持人 motion/accept | 主持人motion/begin（打断复述-确认循环）
* 可以看到 motion/apply （其他人看不到）
* 可以看到 motion/new （其他人看不到）

### 记录员
* meeting/enter 
* 主持人 meeting/begin --> meeting/begin/confirm | meeting/begin/fail 
* 主持人 motion/accept --> motion/retell 
* 主持人 meeting/end --> （如果是保密会议，又要发布会议纪要）meeting/summary

### 与会者 member
* meeting/motion
* meeting/enter 
* motion/apply --> 主持人 motion/member --> motion/speak | motion/update
* 主持人 motion/vote --> member/vote
* motion/new --> （只有主持人能看到）
* 记录员 motion/retell --> motion/confirm --> 主持人 motion/accept | 主持人motion/begin（打断复述-确认循环）记录员不必直接复述，先等等主持人决定。

### 列席者
meeting/enter --> 显示会议过程


### 会议记录
软件自动生成，包括所有事件。如果是保密会议，使用全员公钥加密。

### 会议纪要
由系统自动生成，不加密。如果是保密会议，由记录员决定是否发布。

* meeting/call
* meeting/enter
* meeting/begin
	* meeting/begin/confirm
* motion list
	* motion content
	* member/vote list


### 待增加
* 主持人、记录员选举、罢免
* 记录员驱逐与会者
* 提供动议（决议？）对接执行规章的api？
* 一个共同的event queue，每人一个local的event queue，取两边当前事件的较早一个送入状态机。

## 16:30~17:59
meeting

继续。
## 整理三页面设计
port:6338

分成三个FSM，各自可以独立操作。main页面一个，meeting、motion页面可以多个。

### main
* meeting list
* motion list
* event list: 参与的会议有新的事件，在主页列出，点击分别进入对应页面。

#### event
* user/create:
* motion/create:
* meeting/create:
* meeting/enter:

#### FSM

* init
	* user login: find the key file and input passphrase -> login
	* create a new user -> login
* login
	* motion/create
	* meeting/create
	* meeting/enter  


### meeting
* motion list
	* ID
	* content
	* staus
	* vote result
	* action: 
		* chair: init
		* member: update
		* everyone: enter
* record
	* raw event
	* record
	* summary

#### event:
* motion/create:
* motion/update:
* motion/init:

#### FSM
* init
	* motion/update -> init
	* motion/init -> active
		* motion: init
* active
	* motion/postpone,motion/end ->
		* all motions closed ->
			* open meeting: end
			* csecure meeting: summary
		* else: active
* summary: meetig/summary -> end
* end

### motion
* motion info
	* ID
	* content
* discuss
* action: see FSM

#### event
* motion/retell:
* motion/confirm:
* motion/init:
* motion/postpone:
* motion/apply:
* motion/member:
* motion/free:
* motion/speak:
* motion/update:
* motion/vote:
* member/vote:
* motion/timeout: clerk

#### FSM
* init
	* clerk: motion/retell -> WFC: wating for confirm
	* chair: motion/postpone -> postpone
* WFC
	* motioner: motion/confirm
		* yes: -> WFS: waiting for speak
		* no:-> init
	* chair: motion/postpone -> postpone
* WFS:
	* member: motion/apply -> WFS
	* chair: motion/member -> member
 	* chair: motion/free -> free
	* chair: motion/vote ->vote
	* chair: motion/postpone -> postpone
* member:
	* speaker: motion/speak -> WFS
	* clerk: motion/timeout -> WFS
* free:
	* member:motion/speak ->free
	* chair: motion/member -> member
	* chair: motion/vote -> vote
	* chair: motion/postpone -> postpone
* vote
	* member: member/vote -> vote
	* clerk: motion/timeout-> end
* postpone
	* chair: motion/init -> init
* end