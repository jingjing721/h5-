$(function () {
  //公共变量
  var session = '',
    userId = _DDC.getQueryString('userId'),
    coverUrl = '',
    videoUrl = '',
    play = false,
    title = '',
    vedioDescribe = '',
    likeCount = 0,
    typeCoverUrl = '',
    tvTypeName = '',
    contents = [];

  // 0 开发环境  1 测试环境  2 staging环境  3生产环境
  var status = _DDC.status;
  // status = 1;
  var ajaxUrl  = status==0?'https://mcn-app-d.daydaycook.com.cn/':status==1?'https://mcn-app-t.daydaycook.com.cn/':status==2?'https://mcn-app-s.daydaycook.com.cn/':'https://mcn-app.daydaycook.com.cn/';
  var ajaxUrl2  = status==0?'ddc://mobile-dev.daydaycook.com.cn/':status==1?'ddc://mobile-test.daydaycook.com.cn/':status==2?'ddc://mobile-staging.daydaycook.com.cn/':'ddc://mobile.daydaycook.com.cn/';

  //判断是IOS还是android, true IOS,false 安卓
  if(_DDC.client()){
    //如果是IOS 不操作
  }else{
    if(_DDC.inApp()){
      //如果在app内部 不操作
    }else{
      //重定向
      setTimeout(function () {
        var redirectionHref = ajaxUrl2 + 'app2/ddctv/shown/ddctv_detail.html?userId='+ userId;
        var downloadHref = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.gfeng.daydaycook';
        window.location.href = redirectionHref ? redirectionHref : downloadHref;
      },500)
    }
  }

  //若在日日煮app中，隐藏头部打开按钮
  if(_DDC.inApp()){
    $('.download').hide();
    $('.banner').css('margin-top','0');
  }

  //读取详情接口
  axios.post( ajaxUrl + 'mcn/H5/1.0.0/findTvDetail',{
    id: userId
  }).then(function(xhr){
    var res = xhr.data;
    if(res && res.code == '0000'){
      coverUrl = res.data.coverUrl;
      videoUrl = res.data.videoUrl;
      title = res.data.title;
      vedioDescribe = res.data.vedioDescribe;
      likeCount = res.data.likeCount;
      typeCoverUrl = res.data.typeCoverUrl;
      tvTypeName = res.data.tvTypeName;

      //顶部视频
      if(play){
        $('.video_inner').html('<video autoplay="autoplay" id="thisVideo" src="'+ videoUrl +'" poster="'+ coverUrl +'" x5-video-player-type="h5" x5-video-player-fullscreen="true" controls="controls"><source src="'+ videoUrl +'" type="video/mp4"></source></video>').show();
        $('.video_img').hide();
      }else{
        var _icon = videoUrl ? '<div class="icon"></div>' : '';
        $('.video_img').html('<img src="' + coverUrl + '" />' + _icon).show();
        $('.video_inner').hide();
      }

      //标题
      $('.title').html(title);

      //描述
      $('.top_sub').html(vedioDescribe);

      //点赞量
      $('.zan_num').html(likeCount);

      //分类头图图片
      $('.header_img').attr('src', typeCoverUrl);

      //分类名称
      $('.profile_title').html(tvTypeName);

      //点赞
      $('.zan').on('click', function () {
        if(_DDC.isWeiXin()){
          $('.share_meng').show();
        }else{
          $('.share_meng').hide();
          window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.gfeng.daydaycook'
        }
      });

      //点击视频播放
      $('.video_img').on('click',function(){
        if(videoUrl){
          play = true;
          $('.video_inner').html('<video autoplay="autoplay" id="thisVideo" src="'+ videoUrl +'" poster="'+ coverUrl +'" x5-video-player-type="h5" x5-video-player-fullscreen="true" controls="controls"><source src="'+ videoUrl +'" type="video/mp4"></source></video>').show();
          $('.video_img').hide();
          document.getElementById('thisVideo').play();
        }
      })


    }else if( res.code == '2000'){
      document.title = '你查看的页面已经被删除了哦';
      $('body').append('<div class="empty"><img src="images/empty.jpg"><p>你查看的页面已经被删除了哦</p></div>')
    }else{
      _DDC.warning(res.message || '服务器错误')
    }
  }).catch(function (err) {
    _DDC.warning('服务器错误')
    console.log(err)
  });

  //读取分类栏目详情列表接口
  axios.post( ajaxUrl + 'mcn/H5/1.0.0/findTvListByType',{
    id: userId
  }).then(function(xhr){
    var res = xhr.data;
    if(res && res.code == '0000'){
      contents = res.data;
      if(contents && contents.length > 0){
        var contentList = '';
        var list_item = ''

        contents.forEach(function (item) {

          list_item = '<div class="list_item clearfix">' +
            '<div class="list_pic">' +
            '        <img src=" ' + item.coverUrl + ' " />' +
            '        <div class="video_btn">' +
            '          <i class="play_icon"></i>' +
            '          <span class="play_time">' + formatSeconds(item.videoDuration) + '</span>' +
            '        </div>' +
            '      </div>' +
            '      <div class="list_right">' +
            '        <div class="list_right_title">' + item.title + '</div>' +
            '        <div class="list_right_description">' + item.vedioDescribe + '</div>' +
            '      </div>' +
            '</div>';

          contentList = contentList + list_item;

        });

        $('.list_item_wrap').append(contentList);

        //点击列表，若在微信中，显示蒙层
        $('.list_item').on('click', function () {
          if(_DDC.isWeiXin()){
            $('.share_meng').show();
          }else{
            $('.share_meng').hide();
            window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.gfeng.daydaycook'
          }
        });

      }

    }else if( res.code == '2000'){
      document.title = '你查看的页面已经被删除了哦';
      $('body').append('<div class="empty"><img src="images/empty.jpg"><p>你查看的页面已经被删除了哦</p></div>')
    }else{
      _DDC.warning(res.message || '服务器错误')
    }
  }).catch(function (err) {
    _DDC.warning('服务器错误')
    console.log(err)
  });

  //若在微信中，显示蒙层
  if(_DDC.isWeiXin()){
    $('.share_meng').show();
  }else{
    $('.share_meng').hide();
  }

  //关闭蒙层
  $('.share_meng').on('click', function () {
    $('.share_meng').hide();
  });

  //跳转
  $('.download').on('click',function(e){
    // var userId = _DDC.getQueryString('userId');
    // if(userId){
    // window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.gfeng.daydaycook'
    // window.location.href = ajaxUrl3 + 'app2/ddctv/shown/share.html'
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
  });

  //秒数转化为分秒格式
  function formatSeconds(value) {
    var result = "";
    var secondTime = parseInt(value); // 秒
    var minuteTime = 0; // 分
    if (secondTime < 60) {
      result = "00:" + convertTimeStr(secondTime);
    } else {
      minuteTime = parseInt(secondTime / 60);
      secondTime = parseInt(secondTime % 60);
      result = convertTimeStr(minuteTime) + ":" + convertTimeStr(secondTime);
    }
    return result;
  }

  function convertTimeStr(value) {
    var result = "";
    if (value < 10) {
      result = "0" + value;
    } else if (value >= 10 && value < 60) {
      result = "" + value;
    }
    return result;
  }

});
(function(doc, win) {
  var docEl = doc.documentElement,
    resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
    recalc = function() {

      var clientWidth = docEl.clientWidth;
      if (!clientWidth) return;
      if (clientWidth >= 750) {
        docEl.style.fontSize = '100px';
      } else {
        docEl.style.fontSize = 100 * (clientWidth / 750) + 'px';
      }
    };

  if (!doc.addEventListener) return;
  win.addEventListener(resizeEvt, recalc, false);
  recalc()
  // doc.addEventListener('DOMContentLoaded', recalc, false);
  /*DOMContentLoaded文档加载完成不包含图片资源 onload包含图片资源*/
})(document, window);
