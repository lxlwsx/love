# -*- coding: utf-8 -*-
"""
中文信息处理大作业
功能：新闻爬取 → 数据清洗 → 情感分类 → 词云生成 → 数据可视化
依赖库：requests, beautifulsoup4, jieba, pandas, scikit-learn, wordcloud, matplotlib
"""

import re
import time
import random
import warnings
from collections import Counter

import requests
import jieba
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # 非交互式后端，避免 tkinter 问题
import matplotlib.pyplot as plt
from bs4 import BeautifulSoup
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from wordcloud import WordCloud

warnings.filterwarnings('ignore')

# ============================================================
# 配置
# ============================================================
TARGET_COUNT = 1500
REQUEST_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}
# 新浪社会新闻列表页
NEWS_LIST_URL = 'https://news.sina.com.cn/society/'

# 停用词表（精简版，可替换为外部文件）
STOPWORDS = set([
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
    '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
    '自己', '这', '他', '她', '它', '们', '那', '里', '为', '什么', '被', '把',
    '让', '用', '对', '从', '但', '还', '能', '与', '中', '等', '而', '之', '及',
    '将', '已', '更', '做', '却', '又', '如', '大', '来', '个', '这个', '那个',
    '啊', '吗', '吧', '呢', '哦', '嗯', '呀', '哈', '嘛', '啦', '么',
    '可以', '可能', '因为', '所以', '如果', '虽然', '但是', '然后', '或者',
    '已经', '正在', '通过', '其中', '以及', '关于', '之后', '之前', '目前',
    '表示', '认为', '相关', '进行', '同时', '由于', '根据', '其', '于',
    '多', '年', '月', '日', '时', '分', '秒', '万', '元', '每',
    ' ', '\n', '\t', '\r', '记者', '编辑', '来源', '图片', '视频',
    '责任编辑', '原标题', '本报', '综合', '报道', '消息',
])

# 情感关键词规则
POSITIVE_WORDS = ['赞', '成功', '好消息', '优秀', '获奖', '突破', '创新', '胜利',
                  '幸福', '温暖', '爱心', '救助', '帮助', '感谢', '点赞', '感动',
                  '最美', '英勇', '奉献', '希望', '快乐', '美丽', '进步', '改善',
                  '优惠', '丰收', '增长', '安全', '健康', '和谐']
NEGATIVE_WORDS = ['事故', '批评', '问题', '死亡', '受伤', '犯罪', '诈骗', '盗窃',
                  '暴力', '冲突', '灾难', '坍塌', '爆炸', '火灾', '坠落', '溺水',
                  '中毒', '车祸', '杀害', '抢劫', '绑架', '腐败', '违法', '违规',
                  '污染', '伤害', '失踪', '被拘', '判刑', '惨案']

# ============================================================
# 第一步：爬取新闻
# ============================================================

def get_news_links(target_count):
    """从新浪社会新闻页面获取新闻链接"""
    print(f'[1/5] 正在获取新闻链接（目标 {target_count} 条）...')
    links = []
    page = 1

    while len(links) < target_count:
        try:
            if page == 1:
                url = NEWS_LIST_URL
            else:
                url = f'{NEWS_LIST_URL}index_{page}.shtml'

            resp = requests.get(url, headers=REQUEST_HEADERS, timeout=10)
            resp.encoding = 'utf-8'
            soup = BeautifulSoup(resp.text, 'html.parser')

            # 提取新闻链接
            found = 0
            for a in soup.find_all('a', href=True):
                href = a['href']
                if ('news.sina.com.cn' in href or 'society' in href) and \
                   href.endswith('.shtml') and href not in links:
                    links.append(href)
                    found += 1

            if found == 0:
                # 尝试其他选择器
                for a in soup.select('h2 a, h3 a, .feed-card-title a, .news-item a'):
                    href = a.get('href', '')
                    if href.startswith('http') and href.endswith('.shtml') and href not in links:
                        links.append(href)
                        found += 1

            print(f'  第 {page} 页，累计链接 {len(links)} 条')
            page += 1
            time.sleep(random.uniform(1.0, 2.0))

        except Exception as e:
            print(f'  获取第 {page} 页失败: {e}')
            page += 1
            time.sleep(2)
            if page > 200:
                break

    return links[:target_count]


def fetch_article(url):
    """爬取单篇新闻的标题和正文"""
    try:
        resp = requests.get(url, headers=REQUEST_HEADERS, timeout=10)
        resp.encoding = 'utf-8'
        soup = BeautifulSoup(resp.text, 'html.parser')

        # 标题
        title = ''
        for sel in ['h1.main-title', 'h1', '.article-title', '#artibodyTitle']:
            tag = soup.select_one(sel)
            if tag and tag.get_text(strip=True):
                title = tag.get_text(strip=True)
                break

        # 正文
        content = ''
        for sel in ['#artibody', '.article-content', '.article', '.content', '#article']:
            tag = soup.select_one(sel)
            if tag:
                paragraphs = tag.find_all('p')
                content = '\n'.join(p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True))
                if len(content) > 50:
                    break

        if not content:
            # 回退：取所有 <p> 标签
            paragraphs = soup.find_all('p')
            content = '\n'.join(p.get_text(strip=True) for p in paragraphs)

        if title and len(content) > 30:
            return {'title': title, 'content': content, 'url': url}
    except Exception:
        pass
    return None


def crawl_news(links):
    """批量爬取新闻"""
    print(f'\n[1/5] 正在爬取 {len(links)} 篇新闻正文...')
    articles = []
    for i, link in enumerate(links):
        article = fetch_article(link)
        if article:
            articles.append(article)
        if (i + 1) % 50 == 0:
            print(f'  已爬取 {i + 1}/{len(links)}，有效 {len(articles)} 条')
        # 合理延时，避免给服务器造成压力
        time.sleep(random.uniform(0.5, 1.5))

        # 备用来源：如果新浪爬取效果不好，可从其他新闻源补充
        if len(articles) >= TARGET_COUNT:
            break

    # 如果爬取不足，用备用来源补充
    if len(articles) < TARGET_COUNT:
        print(f'  新浪新闻获取 {len(articles)} 条，尝试从备用来源补充...')
        articles = supplement_from_backup(articles, TARGET_COUNT - len(articles))

    print(f'  爬取完成，共获取 {len(articles)} 条新闻')
    return articles[:TARGET_COUNT]


def supplement_from_backup(existing, need):
    """从备用新闻源补充数据"""
    backup_urls = [
        'https://news.sina.com.cn/',
        'https://news.sina.com.cn/china/',
        'https://news.sina.com.cn/world/',
        'https://news.sina.com.cn/ent/',
        'https://news.sina.com.cn/sports/',
    ]
    articles = list(existing)
    for base_url in backup_urls:
        if len(articles) >= TARGET_COUNT:
            break
        try:
            resp = requests.get(base_url, headers=REQUEST_HEADERS, timeout=10)
            resp.encoding = 'utf-8'
            soup = BeautifulSoup(resp.text, 'html.parser')
            for a in soup.find_all('a', href=True):
                if len(articles) >= TARGET_COUNT:
                    break
                href = a['href']
                if href.endswith('.shtml') and href.startswith('http'):
                    article = fetch_article(href)
                    if article and article not in articles:
                        articles.append(article)
                    time.sleep(random.uniform(0.5, 1.0))
        except Exception:
            continue
    return articles


# ============================================================
# 第二步：数据清洗与分词
# ============================================================

def clean_text(text):
    """清洗文本：去除HTML标签、特殊字符、空行"""
    text = re.sub(r'<[^>]+>', '', text)           # HTML标签
    text = re.sub(r'&[a-z]+;', '', text)           # HTML实体
    text = re.sub(r'http[s]?://\S+', '', text)     # URL
    text = re.sub(r'[a-zA-Z0-9]', '', text)        # 英文数字
    text = re.sub(r'[^一-龥\s，。！？、；：""''（）]', '', text)  # 保留中文和标点
    text = re.sub(r'\s+', ' ', text).strip()        # 多余空白
    return text


def segment_and_remove_stopwords(text):
    """jieba分词并去除停用词"""
    words = jieba.lcut(text)
    return [w for w in words if len(w) > 1 and w not in STOPWORDS]


def process_data(articles):
    """数据清洗 + 分词"""
    print(f'\n[2/5] 正在清洗数据并分词...')
    df = pd.DataFrame(articles)

    # 合并标题和正文
    df['text'] = df['title'] + '。' + df['content']

    # 清洗
    df['clean_text'] = df['text'].apply(clean_text)

    # 去除空行和过短文本
    df = df[df['clean_text'].str.len() > 20].reset_index(drop=True)

    # 分词
    df['words'] = df['clean_text'].apply(segment_and_remove_stopwords)
    df['words_str'] = df['words'].apply(lambda w: ' '.join(w))
    df['text_length'] = df['clean_text'].str.len()

    print(f'  清洗后有效数据 {len(df)} 条')
    return df


# ============================================================
# 第三步：情感标注与机器学习分类
# ============================================================

def label_sentiment(words_list):
    """基于关键词规则标注情感"""
    text = ''.join(words_list)
    pos = sum(1 for w in POSITIVE_WORDS if w in text)
    neg = sum(1 for w in NEGATIVE_WORDS if w in text)
    if pos > neg:
        return 1  # 正面
    elif neg > pos:
        return 0  # 负面
    else:
        return -1  # 无法判断


def ml_classification(df):
    """TF-IDF + 朴素贝叶斯情感分类"""
    print(f'\n[3/5] 正在进行情感分类...')

    # 标注
    df['sentiment'] = df['words'].apply(label_sentiment)
    df_labeled = df[df['sentiment'] != -1].copy()

    pos_count = (df_labeled['sentiment'] == 1).sum()
    neg_count = (df_labeled['sentiment'] == 0).sum()
    print(f'  标注结果：正面 {pos_count} 条，负面 {neg_count} 条，无法判断 {len(df) - len(df_labeled)} 条')

    if pos_count < 10 or neg_count < 10:
        print('  警告：标注样本不足，调整关键词阈值...')
        # 放宽条件：只要命中一个关键词即可
        def label_relaxed(words_list):
            text = ''.join(words_list)
            pos = sum(1 for w in POSITIVE_WORDS if w in text)
            neg = sum(1 for w in NEGATIVE_WORDS if w in text)
            if pos >= 1 and pos >= neg:
                return 1
            elif neg >= 1:
                return 0
            return -1

        df['sentiment'] = df['words'].apply(label_relaxed)
        df_labeled = df[df['sentiment'] != -1].copy()
        pos_count = (df_labeled['sentiment'] == 1).sum()
        neg_count = (df_labeled['sentiment'] == 0).sum()
        print(f'  调整后：正面 {pos_count} 条，负面 {neg_count} 条')

    # TF-IDF
    tfidf = TfidfVectorizer(max_features=5000)
    X = tfidf.fit_transform(df_labeled['words_str'])
    y = df_labeled['sentiment']

    # 划分训练/测试集
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # 朴素贝叶斯分类
    clf = MultinomialNB()
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)

    # 评估
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, target_names=['负面', '正面'])

    print(f'\n  ========== 分类结果 ==========')
    print(f'  准确率: {acc:.4f}')
    print(f'\n{report}')

    return acc, report


# ============================================================
# 第四步：生成词云图
# ============================================================

def generate_wordcloud(df):
    """生成词云图"""
    print(f'\n[4/5] 正在生成词云图...')

    all_words = []
    for words in df['words']:
        all_words.extend(words)

    word_freq = Counter(all_words)
    # 生成词云
    wc = WordCloud(
        font_path='msyh.ttc',  # 微软雅黑，Windows系统自带
        width=1200,
        height=800,
        background_color='white',
        max_words=200,
        max_font_size=120,
        colormap='viridis',
    )
    wc.generate_from_frequencies(word_freq)

    output_path = 'news_wordcloud.png'
    wc.to_file(output_path)
    print(f'  词云图已保存: {output_path}')

    # 输出高频词
    top20 = word_freq.most_common(20)
    print(f'\n  高频词 Top 20:')
    for word, freq in top20:
        print(f'    {word}: {freq}')

    return word_freq


# ============================================================
# 第五步（可选）：文章长度分布直方图
# ============================================================

def plot_length_distribution(df):
    """绘制文章长度分布直方图"""
    print(f'\n[5/5] 正在绘制文章长度分布图...')

    plt.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei']
    plt.rcParams['axes.unicode_minus'] = False

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # 文章长度直方图
    axes[0].hist(df['text_length'], bins=50, color='steelblue', edgecolor='white', alpha=0.8)
    axes[0].set_xlabel('文章长度（字符数）')
    axes[0].set_ylabel('文章数量')
    axes[0].set_title('新闻文章长度分布')

    # 分词数量分布
    df['word_count'] = df['words'].apply(len)
    axes[1].hist(df['word_count'], bins=50, color='coral', edgecolor='white', alpha=0.8)
    axes[1].set_xlabel('分词数量')
    axes[1].set_ylabel('文章数量')
    axes[1].set_title('新闻分词数量分布')

    plt.tight_layout()
    output_path = 'length_distribution.png'
    plt.savefig(output_path, dpi=150)
    plt.close()
    print(f'  分布图已保存: {output_path}')


# ============================================================
# 主流程
# ============================================================

def main():
    print('=' * 60)
    print('  中文信息处理大作业 — 新闻爬取与情感分析')
    print('=' * 60)

    # 1. 爬取新闻
    links = get_news_links(TARGET_COUNT)
    articles = crawl_news(links)

    if len(articles) == 0:
        print('\n未能爬取到新闻，请检查网络连接。')
        print('将使用模拟数据演示后续流程...\n')
        articles = generate_mock_data()

    # 保存原始数据
    df_raw = pd.DataFrame(articles)
    df_raw.to_csv('news_raw.csv', index=False, encoding='utf-8-sig')
    print(f'  原始数据已保存: news_raw.csv')

    # 2. 数据清洗 + 分词
    df = process_data(articles)

    # 3. 情感分类
    accuracy, report = ml_classification(df)

    # 4. 词云图
    word_freq = generate_wordcloud(df)

    # 5. 可视化
    plot_length_distribution(df)

    # 保存清洗后数据
    df.to_csv('news_cleaned.csv', index=False, encoding='utf-8-sig')
    print(f'\n  清洗后数据已保存: news_cleaned.csv')

    print('\n' + '=' * 60)
    print('  全部完成！生成文件：')
    print('    - news_raw.csv          原始爬取数据')
    print('    - news_cleaned.csv      清洗后数据')
    print('    - news_wordcloud.png    词云图')
    print('    - length_distribution.png  长度分布图')
    print('=' * 60)


def generate_mock_data():
    """当爬取失败时，生成模拟数据用于演示"""
    import random
    mock_titles_pos = [
        '社区志愿者为老人送温暖获点赞',
        '科研团队成功攻克技术难题',
        '爱心企业家捐款助力乡村教育',
        '民警英勇救人获群众称赞',
        '扶贫项目取得重大突破成果丰硕',
        '消防员成功营救被困群众',
        '医生妙手回春患者送来锦旗',
        '青年志愿者服务社区获好评',
        '科技企业创新成果获国际认可',
        '贫困学生收到爱心助学金感动落泪',
    ]
    mock_titles_neg = [
        '某地发生严重交通事故致多人受伤',
        '小区物业问题频发居民投诉不断',
        '网络诈骗案件增多警方发出警告',
        '工厂发生爆炸事故造成人员伤亡',
        '食品安全问题曝光引发社会关注',
        '男子因纠纷持刀伤人被警方拘留',
        '暴雨引发洪涝灾害群众紧急转移',
        '企业违规排放污染物被依法查处',
        '电信诈骗团伙被摧毁涉案金额巨大',
        '建筑工地坍塌事故调查报告发布',
    ]
    mock_contents = [
        '据报道，相关部门已介入调查处理此事，具体情况正在进一步核实中。事件发生后，当地居民纷纷表示关注。',
        '记者了解到，该事件引起了社会各界的广泛关注。有关部门已成立专项工作组，全面推进整改落实。',
        '据知情人士透露，目前各项工作正在有序推进中。专家表示，需要进一步加强管理和监督。',
        '当地居民反映，这一问题已经存在较长时间，希望有关部门能够尽快解决。相关部门表示将加大工作力度。',
        '事发后，救援人员第一时间赶赴现场展开救援工作。目前，伤者已全部送往医院接受治疗。',
    ]

    articles = []
    for i in range(TARGET_COUNT):
        if random.random() < 0.5:
            title = random.choice(mock_titles_pos)
        else:
            title = random.choice(mock_titles_neg)
        content = random.choice(mock_contents) + random.choice(mock_contents)
        articles.append({'title': title, 'content': content, 'url': f'mock://news/{i}'})

    print(f'  已生成 {len(articles)} 条模拟数据')
    return articles


if __name__ == '__main__':
    main()
