import subprocess
import os
import tempfile
from typing import Literal, Optional
import shutil
import json
import argparse
import yaml

def get_theme_config(theme: str, text_color: str) -> dict:
    """获取主题配置"""
    if theme == 'dark':
        return {
            'theme': theme,
            'themeVariables': {
                'darkMode': True,
                'background': '#2b2b2b',
                'primaryColor': '#ffffff',
                'primaryTextColor': '#ffffff',
                'primaryBorderColor': '#ffffff',
                'lineColor': '#ffffff',
                'secondaryColor': '#ffffff',
                'tertiaryColor': '#444444'
            }
        }
    elif theme == 'forest':
        return {
            'theme': theme,
            'themeVariables': {
                'primaryColor': '#1f2937',
                'primaryTextColor': '#1f2937',
                'primaryBorderColor': '#1f2937',
                'lineColor': '#1f2937'
            }
        }
    else:
        return {
            'theme': theme,
            'themeVariables': {
                'primaryColor': text_color,
                'primaryTextColor': text_color,
                'primaryBorderColor': text_color,
                'lineColor': text_color
            }
        }

def load_mermaid_code(config_file: str, diagram_name: str = None) -> tuple[str, str]:
    """
    从配置文件加载 Mermaid 代码

    :param config_file: 配置文件路径
    :param diagram_name: 图表名称，如果不指定则使用第一个图表
    :return: (图表名称, Mermaid代码)
    """
    with open(config_file, 'r', encoding='utf-8') as f:
        config = yaml.safe_load(f)
    
    diagrams = config.get('diagrams', {})
    if not diagrams:
        raise ValueError("配置文件中没有找到图表定义")

    if diagram_name:
        if diagram_name not in diagrams:
            raise ValueError(f"找不到名为 '{diagram_name}' 的图表")
        diagram = diagrams[diagram_name]
    else:
        # 使用第一个图表
        diagram_name = next(iter(diagrams))
        diagram = diagrams[diagram_name]
    
    return diagram['name'], diagram['code']

def convert_mermaid_to_image(
    mermaid_code: str,
    output_path: str,
    scale: float = 5.0,
    background_color: str = 'white',
    theme: str = 'default',
    font_size: str = '24px',
    font_family: str = 'arial',
    line_width: str = '3px',
    arrow_width: str = '3',
    padding: str = '20',
    text_color: str = '#1f2020'
) -> None:
    """
    将 Mermaid 语法转换为超高清图片。

    :param mermaid_code: Mermaid 图表的字符串内容
    :param output_path: 输出图片的完整路径 (如 "output.png")
    :param scale: 图片缩放比例，默认5.0（放大五倍）
    :param background_color: 背景颜色，默认白色
    :param theme: 主题样式，可选 'default', 'forest', 'dark', 'neutral'
    :param font_size: 字体大小，如 '24px'
    :param font_family: 字体系列，如 'arial'
    :param line_width: 线条宽度，如 '3px'
    :param arrow_width: 箭头宽度，如 '3'
    :param padding: 内边距，如 '20'
    :param text_color: 文本颜色，如 '#1f2020'
    """
    # 创建一个临时文件存放 Mermaid 代码
    temp_file_path = None
    config_file_path = None
    try:
        # 获取主题配置
        theme_config = get_theme_config(theme, text_color)
        
        # 合并样式配置
        theme_config['themeVariables'].update({
            'fontSize': font_size,
            'fontFamily': font_family,
            'lineWidth': line_width,
            'arrowWidth': arrow_width,
            'padding': padding,
            'fontWeight': 'bold'
        })

        # 添加自定义样式到 Mermaid 代码
        styled_code = f"""%%{{
  init: {json.dumps(theme_config, indent=2)}
}}%%
{mermaid_code.strip()}
"""
        # 确保输出目录存在
        output_dir = os.path.dirname(output_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mmd", mode="w", encoding='utf-8') as temp_file:
            temp_file.write(styled_code)
            temp_file_path = temp_file.name
            print(f"临时文件创建于: {temp_file_path}")
            print(f"生成的 Mermaid 代码:\n{styled_code}")

        # 构建命令，添加高清参数
        command = [
            "mmdc",
            "-i", temp_file_path,
            "-o", output_path,
            "-b", background_color,  # 设置背景色
            "-s", str(scale)         # 设置缩放比例
        ]

        print(f"执行命令: {' '.join(command)}")
        
        # 执行命令
        result = subprocess.run(command, capture_output=True, text=True)
        print(f"命令输出: {result.stdout}")
        
        if result.stderr:
            print(f"错误输出: {result.stderr}")
        
        if os.path.exists(output_path):
            print(f"图片已成功保存到: {output_path}")
            print(f"文件大小: {os.path.getsize(output_path)} 字节")
        else:
            print("图片生成失败")

    finally:
        # 删除临时文件
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        if config_file_path and os.path.exists(config_file_path):
            os.remove(config_file_path)

def main():
    # 创建命令行参数解析器
    parser = argparse.ArgumentParser(description='Mermaid 图表转换工具')
    
    # 添加命令行参数
    parser.add_argument('--config', type=str, default='config.yaml', help='配置文件路径')
    parser.add_argument('--diagram', type=str, help='要生成的图表名称')
    parser.add_argument('--output', type=str, default='output.png', help='输出图片路径')
    parser.add_argument('--scale', type=float, default=6.0, help='图片缩放比例')
    parser.add_argument('--bg-color', type=str, default='white', help='背景颜色')
    parser.add_argument('--theme', type=str, default='default', choices=['default', 'forest', 'dark', 'neutral'], help='主题样式')
    parser.add_argument('--font-size', type=str, default='24px', help='字体大小')
    parser.add_argument('--font-family', type=str, default='arial', help='字体系列')
    parser.add_argument('--line-width', type=str, default='3px', help='线条宽度')
    parser.add_argument('--arrow-width', type=str, default='3', help='箭头宽度')
    parser.add_argument('--padding', type=str, default='20', help='内边距')
    parser.add_argument('--text-color', type=str, default='#1f2020', help='文本颜色')
    
    # 解析命令行参数
    args = parser.parse_args()
    
    try:
        # 从配置文件加载 Mermaid 代码
        diagram_name, mermaid_code = load_mermaid_code(args.config, args.diagram)
        print(f"正在生成图表: {diagram_name}")

        # 调用转换函数
        convert_mermaid_to_image(
            mermaid_code=mermaid_code,
            output_path=args.output,
            scale=args.scale,
            background_color=args.bg_color,
            theme=args.theme,
            font_size=args.font_size,
            font_family=args.font_family,
            line_width=args.line_width,
            arrow_width=args.arrow_width,
            padding=args.padding,
            text_color=args.text_color
        )
    except Exception as e:
        print(f"错误: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    main()
