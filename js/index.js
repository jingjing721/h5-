// _DDC.status = 1;
var $video = $('.video');
var $videoBtn = $('.video_btn');
var $videoInner = $('.video_inner');
var ddc = {
  data:{
    play:false,				//是否播放视频
    contentId:_DDC.getQueryString('contentId'),
    businessCategoryId:_DDC.getQueryString('businessCategoryId'),
    smallPic:'',
    coverImage: '',
    title:'',
    tagList:'',
    summary:'',
    type:'',
    contentDetailList:'',
    contentFoodList:'',
    video:'',
    screenMode: 1,     //屏幕模式，1横屏，2方屏，3竖屏
    imageStyle: 1,     //屏幕模式  1:1比1,2：4比3,3:3比4
    contentSource:0,		//0 待定  1非轮播图    2顶部是轮播图  4用户上传视频
    shareInfo:{},			//分分享信息
  },
  baseUrl:function(){
    // 0 开发环境  1 测试环境  2 staging环境  3生产环境
    var status = _DDC.status;
    // status = 1;
    var ajaxUrl  = status==0?'https://tv-d.daydaycook.com.cn/':status==1?'https://tv-t.daydaycook.com.cn/':status==2?'https://tv-s.daydaycook.com.cn/':'https://tv.daydaycook.com.cn/';
    var ajaxUrl2  = status==0?'https://uc-api-d.daydaycook.com.cn/':status==1?'https://uc-api-t.daydaycook.com.cn/':status==2?'https://uc-api-s.daydaycook.com.cn/':'https://uc-api.daydaycook.com.cn/';
    var ajaxUrl3  = status==0?'ddc://mobile-dev.daydaycook.com.cn/':status==1?'ddc://mobile-test.daydaycook.com.cn/':status==2?'ddc://mobile-staging.daydaycook.com.cn/':'ddc://mobile.daydaycook.com.cn/';

    return {
      ajaxUrl:ajaxUrl,
      ajaxUrl2:ajaxUrl2,
      ajaxUrl3:ajaxUrl3
    }
  },
  init:function(){
    var self = this;

    //若在微信中，显示蒙层
    if(_DDC.isWeiXin()){
      $('.share_meng').show();
    }else{
      $('.share_meng').hide();
    }

    //若在日日煮app中，隐藏头部打开按钮
    if(_DDC.inApp()){
      $('.download').hide();
      $('.swiper-container,.video').css('margin','0');
    }

    axios.post(self.baseUrl().ajaxUrl+'top-content/view-h5',{
      contentId:self.data.contentId,
      businessCategoryId:self.data.businessCategoryId,
      sessionId:'',
      showTag: 1
    }).then(function(xhr) {
      var res = xhr.data;
      if(res && res.code == 0){
        //顶部title标题
        document.title = res.data.title;
        //页面显示样式  1非轮播   2轮播图  4视频
        self.data.contentSource = res.data.contentSource;
        //缩略图
        self.data.smallPic = res.data.smallPic;
        //封面图片
        self.data.coverImage = res.data.coverImage;
        //页面标题
        self.data.title = res.data.title;
        //tags标签
        self.data.tagList = res.data.tagList;
        //简介
        self.data.summary = res.data.summary;
        //图片列表
        self.data.contentDetailList = res.data.contentDetailList;
        //类型
        self.data.type = res.data.type;
        //视频地址
        self.data.video = res.data.video;
        //屏幕模式，1横屏，2方屏，3竖屏
        self.data.screenMode = res.data.screenMode;
        //屏幕模式  1:1比1,2：4比3,3:3比4
        self.data.imageStyle = res.data.imageStyle;
        self.data.contentText = res.data.contentText;
        if(res.data.skuList) self.data.skuList = self.changeSkuList(res.data.skuList);
        if(res.data.contentFoodList) self.data.contentFoodList = res.data.contentFoodList;
        //头像
        self.data.header = res.data.header;
        //昵称
        self.data.nickName = res.data.nickName;
        //分享信息
        self.data.shareInfo = {
          title:res.data.title,
          desc:res.data.summary,
          img:res.data.smallPic,
          link:location.href
        }
        //页面渲染
        self.render();
        //埋点
        gio('page.set', {'h5_contentid': self.data.contentId, 'h5_contentname': res.data.title});

        //判断是IOS还是android, true IOS,false 安卓
        if(_DDC.client()){
          //如果是IOS 不操作
        }else{
          if(_DDC.inApp()){
            //如果在app内部 不操作
          }else{
            //重定向
            setTimeout(function () {
              var redirectionHref = self.baseUrl().ajaxUrl3 + 'app2/ddctv/shown/index.html?businessCategoryId='+ self.data.businessCategoryId +'&contentId='+ self.data.contentId;
              var downloadHref = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.gfeng.daydaycook';
              window.location.href = redirectionHref ? redirectionHref : downloadHref;
            },500)
          }
        }

      }else if(res.code == '-1'){
        $('.index').hide();
        document.title = '你查看的页面已经被删除了哦';
        $('body').append('<div class="empty"><img src="images/empty.jpg"><p>你查看的页面已经被删除了哦</p></div>')
      }else{
        _DDC.warning(res.message || '服务器错误')
      }
    }).catch(function(err) {
      _DDC.warning('服务器错误')
      console.log(err)
    })
    //页面初始化之前先与app交互
  },
  changeSkuList(list){
    //修改返回的商品列表格式
    var self = this;
    var _list = [];
    var max = 0;
    list.forEach(function(item){
      max = _DDC.accAdd(max,item.maxCmmission)
      var _filter = _list.filter(function(ele){
        if(ele.itemId == item.itemId){
          return ele
        }
      })
      if(_filter.length > 0){
        _list.map(function(ele2){
          if(ele2.itemId == _filter[0].itemId){
            ele2.skuId == ele2.skuId+','+_filter[0].skuId
          }
        })
      }else{
        _list.push(item)
      }
    })
    //最高可赚
    // var _zhuan = $('.zhuan');
    // _zhuan.find('span').html(max);
    // if(list && list.length > 0 && max > 0){
    // 	_zhuan.css('display','block')
    // }
    return _list
  },
  render:function(){
    //渲染页面
    var self = this;
    //头部渲染
    self.renderHeader();
    //标题
    $('.title').append(self.data.title);
    //标签
    if(self.data.tagList && self.data.tagList.length > 0){
      var _taglist = '';
      self.data.tagList.forEach(function(item){
        _taglist = _taglist + '<span>#'+ item.name +'</span>'
      })
      $('.tags').html(_taglist)
    }
    //简介
    if(self.data.summary){
      $('.summary').html(self.data.summary);
    }

    //普通图文
    if(self.data.contentDetailList && self.data.contentDetailList.length > 0 && self.data.type==1 && self.data.contentSource == 1){
      var _list = '';
      self.data.contentDetailList.forEach(function(item){
        var _img = item.image?'<div class="item img"><img src="'+ item.image +'"></div>':'';
        var _detail = item.detail?'<div class="item word">'+ item.detail +'</div>':'';
        _list = _list + _img + _detail;
      })
      if(_list){
        $('.list').html(_list);
      }
    }

    //视频
    if(self.data.contentDetailList && self.data.contentDetailList.length > 0 && self.data.type==1 && self.data.contentSource == 4){
      var _list = '';
      self.data.contentDetailList.forEach(function(item){
        // var reg = new RegExp('<' + tag + '>' + '(.*?)' + '</' + tag + '>');
        if(item.detail && item.detail.indexOf('<tag>') > -1){
          item.detail = item.detail.replace(/<tag>/g, "<em>#</em><tag>");
          item.detail = item.detail.replace(/<\/tag>/g, "<\/tag>");
        }
        var _img = item.image?'<div class="item img"><img src="'+ item.image +'"></div>':'';
        var _detail = item.detail?'<div class="item word">'+ item.detail +'</div>':'';
        _list = _list + _img + _detail;
      })
      if(_list){
        $('.list').html(_list);
      }
      $('.content').hide();
    }

    //食材
    if(self.data.contentFoodList && self.data.contentFoodList.length > 0 && self.data.type == 2 && self.data.contentSource == 1){
      var _foodList = '';
      self.data.contentFoodList.forEach(function(item){
        _foodList = _foodList + '<div class="item"><div class="left">'+ item.name +'</div><div class="left">'+ item.count +'</div></div>';
      })
      $('.material').append(_foodList).css('display','block');
    }

    //做菜步骤
    if(self.data.contentDetailList && self.data.contentDetailList.length > 0 && self.data.type==2){
      //修改数据格式
      self.data.contentDetailList.map(function(item) {
        item.first = item.groupTitle.split('/')[0];
        item.last = item.groupTitle.split('/')[1];
      })
      var _list = '';
      self.data.contentDetailList.forEach(function(item){
        var _title = '<div class="title2">'+ item.first +'<text>/'+ item.last +'</text></div>';
        var _img = item.image?'<div class="imgs"><img src="'+ item.image +'" alt=""></div>':'';
        var _detail = item.detail?'<div class="word">'+ item.detail +'</div>':'';
        _list = _list + _title + '<div class="main">' + _img + _detail + '</div>';
      })
      if(_list){
        $('.step').html(_list).css('display','block');
      }
    }
    //商品列表
    if(self.data.skuList && self.data.skuList.length > 0){
      var _skuList = '';
      self.data.skuList.forEach(function(item){
        var _item = '<div class="item" data-productId="'+ item.itemId +'">';
        _item += '<img src="'+ item.productImg +'" alt="">';
        _item += '<div class="title two-line">'+ item.productName +'</div>';
        _item += '<div class="price">';
        _item += '<span class="price">￥'+ item.marketPrice +'</span>';
        // _item += '<span class="price2">￥234</span>';
        _item += '<div class="buy right">立即购买</div>';
        _item += '</div>';
        _item += '</div>';
        _skuList = _skuList + _item;
      })
      $('.products').html(_skuList);
    }
    //分享
    self.wxShare(self.data.shareInfo.title,self.data.shareInfo.desc,self.data.shareInfo.img,self.data.shareInfo.link); // 调用微信分享
    //后台传过来图文
    $('.contentText').html(self.data.contentText);
    //操作
    self.handle();
  },
  renderHeader:function(){
    //专门针对头部渲染
    var self = this;

    if(self.data.contentSource == 1){
      //非轮播图(图文菜品)
      if(self.data.coverImage && !self.data.play){
        var _icon = self.data.video?'<div class="icon"></div>':'';
        $videoBtn.html('<img src="'+ self.data.coverImage +'">'+_icon).show();
        $videoInner.hide();
        self.changeHeightSource1();
      }

      if(self.data.play && $video.find('video').length == '0'){
        $videoInner.html('<video autoplay="autoplay" id="thisVideo" src="'+ self.data.video +'" poster="'+ self.data.coverImage +'" x5-video-player-type="h5"  x5-video-player-fullscreen="true" controls="controls"><source src="'+ self.data.video +'" type="video/mp4"></source></video>').show();
        $videoBtn.hide();
        self.changeHeightSource1();
      }
      // $video.html('<video autoplay="autoplay" src="'+ self.data.video +'" controls="controls" poster="'+ self.data.smallPic +'" style="width: 100%; position: absolute; bottom: 0;">您的浏览器不支持视频播放</video>');
      // self.changeHeightSource();
    }else if(self.data.contentSource == 4){
      //视频
      if(self.data.smallPic && !self.data.play){
        var _icon = self.data.video?'<div class="icon"></div>':'';
        $videoBtn.html('<img src="'+ self.data.smallPic +'">'+_icon).show();
        $videoInner.hide();
        self.changeHeightSource();
      }
      if(self.data.play && $video.find('video').length == '0'){
        $videoInner.html('<video autoplay="autoplay" id="thisVideo" src="'+ self.data.video +'" poster="'+ self.data.smallPic +'" x5-video-player-type="h5"  x5-video-player-fullscreen="true" controls="controls"><source src="'+ self.data.video +'" type="video/mp4"></source></video>').show();
        $videoBtn.hide();
        self.changeHeightSource();
      }
      // $video.html('<video autoplay="autoplay" src="'+ self.data.video +'" controls="controls" poster="'+ self.data.smallPic +'" style="width: 100%; position: absolute; bottom: 0;">您的浏览器不支持视频播放</video>');
      // self.changeHeightSource();
      //用户头像
      self.data.header = self.data.header ? self.data.header : 'images/logo.png';
      $('.users').html('<img src="'+ self.data.header +'">' + self.data.nickName).show();
    }else{
      //轮播图
      var _html = '';
      self.data.contentDetailList.forEach(function(item){
        _html += '<div class="swiper-slide"><img src="'+ item.image +'?imageslim"></div>';
      })
      $('.swiper-container .swiper-wrapper').html(_html);
      $('.swiper-container').show();
      $('.video').hide();
      $('.content').hide();
      new Swiper('.swiper-container', {
        pagination: {
          el: '.swiper-pagination',
        },
      });
      self.changeHeightSource();
      //用户头像
      self.data.header = self.data.header ? self.data.header : 'images/logo.png';
      $('.users').html('<img src="'+ self.data.header +'">' + self.data.nickName).show();
      //标签前加#
      if(self.data.contentDetailList[0].detail && self.data.contentDetailList[0].detail.indexOf('<tag>') > -1){
        self.data.contentDetailList[0].detail = self.data.contentDetailList[0].detail.replace(/<tag>/g, "<em>#</em><tag>");
        self.data.contentDetailList[0].detail = self.data.contentDetailList[0].detail.replace(/<\/tag>/g, "<\/tag>");
        //var tag = '<\/tag>';
        //var lastTag = tag.substring(self.data.contentDetailList[0].detail.lastIndexOf(tag));
        // var str = self.data.contentDetailList[0].detail;
        // var c = str.substring(0,str.lastIndexOf('<\/tag>')); //这样就获取到了前面的字符串。
        // str = c + '<\/tag><br\/>';   //这样a就变成了 abababababa11111
        // console.log(str);
      }
      //后台传过来图文
      $('.contentText').html(self.data.contentDetailList[0].detail);
    }
  },
  handle:function(){
    //相关操作方法绑定
    var self = this;
    $videoBtn.on('click',function(){
      if(self.data.video){
        self.data.play = true;
        self.renderHeader();
        console.log($videoInner.find('#thisVideo'))
        document.getElementById('thisVideo').play();
      }
    })
    $('.products .item').on('click',function(){
      var productId = $(this).attr('data-productId');
      var shareCode = _DDC.getQueryString('shareCode');
      var skuId;
      self.data.skuList.map(function(item){
        if(item.itemId == productId){
          skuId = item.skuId;
        }
      })
      window.location.href = location.origin + '/shop/#/productdetail?productId='+ productId +'&shareCode='+ shareCode +'&skuId='+skuId;
    })
    //关闭蒙层
    $('.share_meng').on('click', function () {
      $('.share_meng').hide();
    });
    //跳转
    $('.download').on('click',function(){
      // var userId = _DDC.getQueryString('userId');
      // if(userId){
      // window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.gfeng.daydaycook'
      // }else{
      // var _url = location.origin + '/app2/invite/inviteFriends/share.html?userId='+userId+'&inviteCode=YQ_20180904_CZ';
      // window.location.href = _url
      // }

      //若在微信中，显示蒙层
      if(_DDC.isWeiXin()){
        $('.share_meng').show();
      }else{
        $('.share_meng').hide();
        window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.gfeng.daydaycook'
      }

    })
  },
  //微信分享给朋友或朋友圈
  wxShare:function(title,desc,img,link) {
    var self = this;
    var link = link || window.location.href;
    var encodeURL = encodeURIComponent(link);
    $.ajax({
      type: 'get',
      url: self.baseUrl().ajaxUrl2+'/wx/signature?url='+encodeURL,
      success: function(res) {
        var data = JSON.parse(res);
        if(data.data){
          var obj = data.data;
          // console.log(obj)
          var thisId = obj.appId;
          var thisTimestamp = obj.timestamp;
          var thisNonceStr = obj.nonceStr;
          var thisSignature = obj.signature;
          // console.log(wx)
          wx.config({
            debug: false,
            appId: thisId,
            timestamp: thisTimestamp,
            nonceStr: thisNonceStr,
            signature: thisSignature,
            jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage']
          });

          wx.ready(function() {
            // 获取“分享到朋友圈” 按钮点击状态及自定义分享内容接口
            wx.onMenuShareTimeline({
              title: title, // 分享标题
              link: link,
              imgUrl: img, // 分享图标
              success: function() {},
              cancel: function() {}
            });

            // 获取“ 分享给朋友” 按钮点击状态及自定义分享内容接口
            wx.onMenuShareAppMessage({
              title: title, // 分享标题
              desc: desc, // 分享描述
              link: link,
              imgUrl: img, // 分享图标
              type: '', // 分享类型,music、video或link，不填默认为link
              dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
              success: function() {},
              cancel: function() {}
            });
          });
        }
      },
      error:function(err){
        console.log('分享接口出错')
      }
    });
  },
  changeHeightSource1: function () {
    var self = this;
    //获取屏幕宽度
    var mobileWidth = document.body.clientWidth || document.documentElement.clientWidth;

    //判断是否为视频
    if(self.data.video){
      if(self.data.screenMode == 1){
        $('.video, .swiper-container').css({'height': (9/16)*mobileWidth });
      }else if(self.data.screenMode == 2){
        $('.video, .swiper-container').css({'height': mobileWidth });
      }else{
        $('.video, .swiper-container').css({'height': (4/3)*mobileWidth });
        $('.video video').css({'height': 'auto'});
        $('.video video').attr('height', 'auto');
        $('.video').css({'align-items': 'flex-end'});
      }
    }else{
      $('.video, .swiper-container').css({'height':'4.3rem'});
    }
  },
  changeHeightSource: function () {
    var self = this;
    //获取屏幕宽度
    var mobileWidth = document.body.clientWidth || document.documentElement.clientWidth;

    //判断是否为视频
    if(self.data.video){
      if(self.data.screenMode == 1){
        $('.video, .swiper-container').css({'height': (9/16)*mobileWidth });
      }else if(self.data.screenMode == 2){
        $('.video, .swiper-container').css({'height': mobileWidth });
      }else{
        $('.video, .swiper-container').css({'height': (4/3)*mobileWidth });
        $('.video video').css({'height': 'auto'});
        $('.video video').attr('height', 'auto');
        $('.video').css({'align-items': 'flex-end'});
      }
    }else{
      //imageStyle 1:1比1,2：4比3,3:3比4
      if(self.data.imageStyle == 1){
        $('.video, .swiper-container').css({'height': mobileWidth });
      }else if(self.data.imageStyle == 2){
        $('.video, .swiper-container').css({'height': (3/4)*mobileWidth });
      }else{
        $('.video, .swiper-container').css({'height': (4/3)*mobileWidth });
      }
    }
  }
}
ddc.init();

