# 示例代码，仅供参考，自行安装下列依赖，不再赘述
import http.server
import socketserver
import json
import urllib.parse
from datetime import datetime
from pync import Notifier
import os

class ReminderHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/reminders':
            try:
                # 获取请求内容长度
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                
                # 解析JSON数据
                data = json.loads(post_data.decode('utf-8'))
                
                if not data or 'text' not in data:
                    self.send_error_response(400, '缺少文本内容')
                    return
                
                text = data['text']
                timestamp = data.get('timestamp', datetime.now().isoformat())
                
                # 使用pync发送系统通知
                Notifier.notify(
                    text,
                    title='本地提醒器',
                    subtitle=f'时间: {timestamp}',
                    sound='default'
                )
                
                # 记录到日志文件
                log_entry = f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {text}\n"
                with open('reminders.log', 'a', encoding='utf-8') as f:
                    f.write(log_entry)
                
                print(f"已发送通知: {text}")
                
                # 返回成功响应
                response_data = {
                    'success': True,
                    'message': '提醒已发送',
                    'text': text,
                    'timestamp': timestamp
                }
                
                self.send_success_response(response_data)
                
            except json.JSONDecodeError:
                self.send_error_response(400, '无效的JSON格式')
            except Exception as e:
                print(f"错误: {str(e)}")
                self.send_error_response(500, f'服务器错误: {str(e)}')
        else:
            self.send_error_response(404, '接口不存在')
    
    def do_GET(self):
        if self.path == '/health':
            response_data = {
                'status': 'ok',
                'message': '服务器运行正常',
                'timestamp': datetime.now().isoformat()
            }
            self.send_success_response(response_data)
        else:
            self.send_error_response(404, '页面不存在')
    
    def do_OPTIONS(self):
        # 处理CORS预检请求
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def send_success_response(self, data):
        response_json = json.dumps(data, ensure_ascii=False)
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(response_json.encode('utf-8'))
    
    def send_error_response(self, status_code, message):
        response_data = {
            'error': message,
            'status_code': status_code
        }
        response_json = json.dumps(response_data, ensure_ascii=False)
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(response_json.encode('utf-8'))
    
    def log_message(self, format, *args):
        # 自定义日志格式
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")

def main():
    PORT = 3333
    
    print("启动本地提醒器服务器...")
    print(f"服务器地址: http://localhost:{PORT}")
    print(f"API接口: http://localhost:{PORT}/api/reminders")
    print("健康检查: http://localhost:3333/health")
    print("按 Ctrl+C 停止服务器")
    print("-" * 50)
    
    try:
        with socketserver.TCPServer(("", PORT), ReminderHandler) as httpd:
            print(f"服务器已启动，监听端口 {PORT}")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
    except Exception as e:
        print(f"启动服务器时出错: {e}")

if __name__ == '__main__':
    main()
