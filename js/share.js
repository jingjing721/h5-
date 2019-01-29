//延迟3秒 关闭蒙层
// $(function(){
//   setTimeout(function () {
//     $('.share_meng').hide();
//   },3000);
//
// });

function client(){
  return /(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)?true:false
}
function jump(){
  if(client()){
    //IOS
    window.location.href = 'https://itunes.apple.com/cn/app/id1060973985';
  }else{
    window.location.href = 'http://sj.qq.com/myapp/detail.htm?apkName=com.gfeng.daydaycook';
  }
}
