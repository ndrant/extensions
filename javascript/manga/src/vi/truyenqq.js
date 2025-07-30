const mangayomiSources = [
	{
		name: "truyenQQ",
		lang: "vi",
		baseUrl: "https://truyenqqgo.com/",
		apiUrl: "",
		iconUrl:
			"https://st.truyenqqgo.com/template/frontend/images/logo-icon.png",
		typeSource: "single",
		itemType: 0,
		version: "0.0.1",
		pkgPath: "",
		notes: "",
	},
];

class DefaultExtension extends MProvider {
	getHeaders(url) {
		return {
			Referer: this.source.baseUrl,
		};
	}

	statusCode(status) {
		return (
			{
				"Đang Cập Nhật": 0,
				"Hoàn Thành": 1,
				"on hiatus": 2,
				discontinued: 3,
				"not yet published": 4,
			}[status] ?? 5
		);
	}

	async getPopular(page) {
		var url = `${this.source.baseUrl}`;
		var res = await new Client().get(url, this.getHeaders());
		var doc = new Document(res.body);
		var list = [];
		var mangaElements = doc.select("#div_suggest > ul > li");

		for (var manga of mangaElements) {
			var imageUrl = manga.selectFirst("img").getSrc;
			var link = manga.selectFirst("div").selectFirst("a").attr("href");
			var name = manga.select(".book_info > .book_name > h3 > a")[0].text;

			list.push({ name, imageUrl, link });
		}

		var hasNextPage = false;

		return { list, hasNextPage };
	}

	get supportsLatest() {
		throw new Error("supportsLatest not implemented");
	}

	async getLatestUpdates(page) {
		var url = `${this.source.baseUrl}truyen-moi-cap-nhat/trang-${page}.html`;
		var res = await new Client().get(url, this.getHeaders());
		var doc = new Document(res.body);
		var list = [];
		var mangaElements = doc.select(
			"#main_homepage > .list_grid_out > ul > li"
		);

		for (var manga of mangaElements) {
			var imageUrl = manga.selectFirst("img").getSrc;
			var link = manga.selectFirst("div").selectFirst("a").attr("href");
			var name = manga.select(".book_info > .book_name > h3 > a")[0].text;

			list.push({ name, imageUrl, link });
		}

		const hasNextPage = true;

		return { list, hasNextPage };
	}

	async search(query, page, filters) {
		var url = `${this.source.baseUrl}tim-kiem/trang-${page}.html?q=${query}`;
		var res = await new Client().get(url, this.getHeaders());
		var doc = new Document(res.body);
		var list = [];
		var mangaElements = doc.select(
			"#main_homepage > .list_grid_out > ul > li"
		);

		for (var manga of mangaElements) {
			var imageUrl = manga.selectFirst("img").getSrc;
			var link = manga.selectFirst("div").selectFirst("a").attr("href");
			var name = manga.select(".book_info > .book_name > h3 > a")[0].text;

			list.push({ name, imageUrl, link });
		}

		const hasNextPage = true;

		return { list, hasNextPage };
	}

	async getDetail(url) {
		var baseUrl = this.source.baseUrl;
		if (url.includes(baseUrl)) {
			url = url.replace(baseUrl, "");
		} else {
			url = url.slice(1);
		}

		var link = `${baseUrl}${url}`;
		var res = await new Client().get(link, this.getHeaders());
		var doc = new Document(res.body);

		var mangaName = doc.selectFirst(".book_info .book_other > h1").text;
		var imageUrl = doc.selectFirst(".book_avatar > img").getSrc;
		var statusText = doc.selectFirst(".status.row > .col-xs-9").text;
		var author = doc.selectFirst(".author.row").select("p")[1].text;
		var status = this.statusCode(statusText);

		var description = "";

		doc.selectFirst(".story-detail-info > p").text !== ""
			? (description = doc.selectFirst(".story-detail-info > p").text)
			: (description = doc.selectFirst(".story-detail-info").text);

		var genre = [];
		var genreList = doc.selectFirst("ul.list01").select("li");
		for (var gen of genreList) {
			genre.push(gen.text);
		}

		var chapters = [];
		var chapList = doc.select(".list_chapter > .works-chapter-list > div");

		for (var chap of chapList) {
			var name = chap.selectFirst("a").text;
			var url = chap.selectFirst("a").getHref;
			chapters.push({ name, url });
		}

		return {
			name: mangaName,
			description,
			link,
			imageUrl,
			author,
			status,
			genre,
			chapters,
		};
	}

	// For manga chapter pages
	async getPageList(url) {
		var url = url.slice(1);

		var link = `${this.source.baseUrl}${url}`;

		var res = await new Client().get(link, this.getHeaders());
		var doc = new Document(res.body);

		var urls = [];

		var pages = doc.select(".chapter_content > div")[1].select("div");

		for (var page of pages) {
			var img = page.selectFirst("img").getSrc;
			if (img != null) urls.push(img);
		}

		return urls;
	}
}
