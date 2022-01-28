const cheerio = require('cheerio')
const axios = require('axios')
const { default: Axios } = require('axios');
const { JSDOM } = require('jsdom')
const FormData = require('form-data')
const qs = require('qs')
const { exec } = require('child_process');
const fs = require('fs');
const fetch = require('node-fetch')
const { fromBuffer } = require('file-type')
const randomarray = async (array) => {
	return array[Math.floor(Math.random() * array.length)]
}
const result = []

const gempa = () => new Promise((resolve, reject) => {
  axios.get('https://www.bmkg.go.id/gempabumi/gempabumi-dirasakan.bmkg').then((response) => {
  const $ = cheerio.load(response.data)

  const urlElems = $('table.table-hover.table-striped')

  for (let i = 0; i < urlElems.length; i++) {
    const urlSpan = $(urlElems[i]).find('tbody')[0]

    if (urlSpan) {
      const urlData = $(urlSpan).find('tr')[0]
      var Kapan = $(urlData).find('td')[1]
      var Letak = $(urlData).find('td')[2]
      var Magnitudo = $(urlData).find('td')[3]
      var Kedalaman = $(urlData).find('td')[4]
      var Wilayah = $(urlData).find('td')[5]
      var lintang = $(Letak).text().split(' ')[0]
      var bujur = $(Letak).text().split(' ')[2]
      var hasil = {
        Waktu: $(Kapan).text(),
        Lintang: lintang,
        Bujur: bujur,
        Magnitudo: $(Magnitudo).text(),
        Kedalaman: $(Kedalaman).text().replace(/\t/g, '').replace(/I/g, ''),
        Wilayah: $(Wilayah).text().replace(/\t/g, '').replace(/I/g, '').replace('-','').replace(/\r/g, '').split('\n')[0],
		Map: $('div.modal-body > div > div:nth-child(1) > img').attr('src'),
      }
      // We then print the text on to the console
      resolve(hasil);
    }
    console.log(hasil)
  }
  }).catch(err => reject(err))
})

async function covid(){
	return new Promise(async(resolve, reject) => {
		axios.get('https://covid19.go.id/')
		.then(({ data }) => {
			const $ = cheerio.load(data)
			const hasil = [];
			$('#case > div > div > div > div > div:nth-child(2)').each(function(a,b) {
				const Positif_indo = $(b).find('div:nth-child(3) > strong').text()
				const Meninggal_indo = $(b).find('div:nth-child(5) > strong').text()
				const Sembuh_indo = $(b).find('div:nth-child(4) > strong').text()
				const Update_indo = $(b).find('div.pt-4.text-color-black.text-1').text().trim()
			$('#case > div > div > div > div > div:nth-child(1)').each(function(c,d) {
					const negara = $(d).find('div:nth-child(3) > strong').text() 
					const Positif_global = $(d).find('div:nth-child(4) > strong').text()
					const Meninggal_global = $(d).find('div:nth-child(5) > strong').text()
					const Update_global = $(d).find('div.pt-4.text-color-grey.text-1').text().trim()
				const result = {
				  status: 200,
					indo : {
						indoP: Positif_indo,
						indoM: Meninggal_indo,
						indoS: Sembuh_indo,
						indoU: Update_indo.split(':')[1]
					},
					global: {
						negara: negara,
						positif: Positif_global,
						meninggal: Meninggal_global,
						update: Update_global.split(':')[1].split('\n')[0]
					}
				}
				hasil.push(result)
				})
			})
			resolve(hasil[0])
		})
		.catch(reject)
	})
}

function upload (media)  {
    return new Promise(async (resolve, reject) => {
    try {
        let { ext } = await fromBuffer(media)
        console.log('Uploading image to server telegra.ph')
        let form = new FormData()
        form.append('file', media, 'tmp.' + ext)
        await fetch('https://telegra.ph/upload', {
            method: 'POST',
            body: form
        })
        .then(res => res.json())
        .then(res => {
            if (res.error) return reject(res.error)
            resolve('https://telegra.ph' + res[0].src)
        })
        .catch(err => reject(err))
    } catch (e) {
        return console.log(e)
    }
})
}

function tiktoksearch(query) {
	return new Promise((resolve, reject) => {
		axios.get('https://brainans.com/search?query='+query).then(res => {
			const $ = cheerio.load(res.data)
			const result = []
			const main = $('#search-container > div')
			main.each( function() {
				const user_url = 'https://brainans.com'+$(this).find('div.content__text > a').attr('href')
				const user = $(this).find('div.content__text > a').text()
				const username = $(this).find('div.content__text > p').text()
				result.push({ user, username, user_url })
				const hasil = {
					result: result
				}
				resolve(hasil)
			})
		}).catch(reject)
	})
}

function linkwa(nama){
	return new Promise((resolve,reject) => {
		axios.get('http://ngarang.com/link-grup-wa/daftar-link-grup-wa.php?search='+ nama +'&searchby=name')
		.then(({ data }) => {
			const $ = cheerio.load(data);
			const result = [];
			const lnk = [];
			const nm = [];
		$('div.wa-chat-title-container').each(function(a,b){
			const limk = $(b).find('a').attr('href');
			lnk.push(limk)
			})
		$('div.wa-chat-title-text').each(function(c,d) {
			const name = $(d).text();
			nm.push(name)
			})
		for( let i = 0; i < lnk.length; i++){
			result.push({
				nama: nm[i].split('. ')[1],
				link: lnk[i].split('?')[0]
			})
		}
		resolve(result)
		})
	.catch(reject)
	})
}

function trendtwit(){
	return new Promise((resolve, reject) => {
		axios.get(`https://getdaytrends.com/Indonesia/`)
			.then(({
				data
			}) => {
				const $ = cheerio.load(data)
				const hastag = [];
				const tweet = [];
				const result = [];
				$('#trends > table.table.table-hover.text-left.clickable.ranking.trends.wider.mb-0 > tbody > tr> td.main > a').each(function(a, b) {
					deta = $(b).text()
					hastag.push(deta)
				})
				$('#trends > table.table.table-hover.text-left.clickable.ranking.trends.wider.mb-0 > tbody > tr > td.main > div > span').each(function(a, b) {
					deta = $(b).text()
					tweet.push(deta)
				})
				num = 1
				for (let i = 0; i < hastag.length; i++) {
					result.push({
						rank: num,
						hastag: hastag[i],
						tweet: tweet[i]
					})
					num += 1
				}
				resolve({
					result: result
				})
			})
			.catch(reject)
	})
}

async function igstalk(username, sessionId){
	try {
    const opt = {
      headers: {
        "cache-control": "no-cache",
        'user-agent': "Instagram 10.8.0 Android (18/4.3; 320dpi; 720x1280; Xiaomi; HM 1SW; armani; qcom; en_US)",
        'cookie': `${sessionId}`,
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7,pt;q=0.6,ru;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'pragma': 'no-cache',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1'
      }
    };
    const { data } = await axios.get('https://www.instagram.com/' + username + '/?__a=1', opt);
    const metaData = data.graphql.user;
    const final = {
      username: metaData.username,
      full_name: metaData.full_name,
      profile_id: metaData.id,
      biography: metaData.biography,
      followers: metaData.edge_follow.count,
      following: metaData.edge_followed_by.count,
      external_url: metaData.external_url,
      is_private: metaData.is_private,
      is_verified: metaData.is_verified,
      profile_pic_url_hd: metaData.profile_pic_url_hd,
      posts: metaData.edge_owner_to_timeline_media.edges.map(x => 'https://www.instagram.com/p/' + x.node.shortcode)
    };
    return final;
  } catch (e) {
    console.log(e)
  }
}

function webp2gifFile(path) {
     return new Promise((resolve, reject) => {
          const bodyForm = new FormData()
          bodyForm.append('new-image-url', '')
          bodyForm.append('new-image', fs.createReadStream(path))
          Axios({
               method: 'post',
               url: 'https://s6.ezgif.com/webp-to-mp4',
               data: bodyForm,
               headers: {
                    'Content-Type': `multipart/form-data; boundary=${bodyForm._boundary}`
               }
          }).then(({ data }) => {
               const bodyFormThen = new FormData()
               const $ = cheerio.load(data)
               const file = $('input[name="file"]').attr('value')
               const token = $('input[name="token"]').attr('value')
               const convert = $('input[name="file"]').attr('value')
               const gotdata = {
                    file: file,
                    token: token,
                    convert: convert
               }
               bodyFormThen.append('file', gotdata.file)
               bodyFormThen.append('token', gotdata.token)
               bodyFormThen.append('convert', gotdata.convert)
               Axios({
                    method: 'post',
                    url: 'https://ezgif.com/webp-to-mp4/' + gotdata.file,
                    data: bodyFormThen,
                    headers: {
                         'Content-Type': `multipart/form-data; boundary=${bodyFormThen._boundary}`
                    }
               }).then(({ data }) => {
                    const $ = cheerio.load(data)
                    const result = 'https:' + $('div#output > p.outfile > video > source').attr('src')
                    resolve({
                         status: true,
                         message: "Created By Herman Chanel",
                         result: result
                    })
               }).catch(reject)
          }).catch(reject)
     })
}

function playstore(name){
	return new Promise((resolve, reject) => {
		axios.get('https://play.google.com/store/search?q='+ name +'&c=apps')
		.then(({ data }) => {
			const $ = cheerio.load(data)
			let ln = [];
			let nm = [];
			let dv = [];
			let lm = [];
			const result = [];
			$('div.wXUyZd > a').each(function(a,b){
				const link =  'https://play.google.com' + $(b).attr('href')
				ln.push(link);
			})
			$('div.b8cIId.ReQCgd.Q9MA7b > a > div').each(function(d,e){
				const name = $(e).text().trim()
				nm.push(name);
			})
			$('div.b8cIId.ReQCgd.KoLSrc > a > div').each(function(f,g){
				const dev = $(g).text().trim();
				dv.push(dev)
			})
			$('div.b8cIId.ReQCgd.KoLSrc > a').each(function(h,i){
				const limk = 'https://play.google.com' + $(i).attr('href');
				lm.push(limk);
			})			
		for (let i = 0; i < ln.length; i++){
			result.push({
				name: nm[i],
				link: ln[i],
				developer: dv[i],
				link_dev: lm[i]
			})
	}
		resolve(result)
		})
	.catch(reject)
	})
}

const wiki = async (query) => {
const res = await axios.get(`https://id.m.wikipedia.org/w/index.php?search=${query}`)
const $ = cheerio.load(res.data)
const hasil = []
let wiki = $('#mf-section-0').find('p').text()
let thumb = $('#mf-section-0').find('div > div > a > img').attr('src')
thumb = thumb ? thumb : '//pngimg.com/uploads/wikipedia/wikipedia_PNG35.png'
thumb = 'https:' + thumb
let judul = $('h1#section_0').text()
hasil.push({ wiki, thumb, judul })
return hasil
}

function artinama(query){
	return new Promise((resolve, reject) => {
		queryy = query.replace(/ /g, '+')
		axios.get('https://www.primbon.com/arti_nama.php?nama1=' + query + '&proses=+Submit%21+')
			.then(({
				data
			}) => {
				const $ = cheerio.load(data)
				const result = $('#body').text();
				const result2 = result.split('\n      \n        \n        \n')[0]
				const result4 = result2.split('ARTI NAMA')[1]
				const result5 = result4.split('.\n\n')
				const result6 = result5[0] + '\n\n' + result5[1]
				resolve(result6)
			})
			.catch(reject)
	})
}

function merdeka() {
    return new Promise(async(resolve, reject) => { 
    const jsonIndex = ['index2', 'index3', 'index4', 'index5']
    const randIndex = await randomarray(jsonIndex)
    axios.get(`https://www.merdeka.com/peristiwa/${randIndex}/`).then(res => {
        const $ = cheerio.load(res.data)
        $('#mdk-content-center > div.inner-content > ul > li > div').each(function(a, b) {
            const link = 'https://www.merdeka.com' + $(b).find('h3 > a').attr('href')
            const title = $(b).find('h3').text()
            const upload_date= $(b).find('div > span').text().trim()
			const thumb = $(b).find('div > a > img').attr('src')
            result.push({ link, title, upload_date, thumb })
        })
        resolve(result)
    }).catch(reject)
})
}

function pinterest(querry){
	return new Promise(async(resolve,reject) => {
		 axios.get('https://id.pinterest.com/search/pins/?autologin=true&q=' + querry, {
			headers: {
			"cookie" : "_auth=1; _b=\"AVna7S1p7l1C5I9u0+nR3YzijpvXOPc6d09SyCzO+DcwpersQH36SmGiYfymBKhZcGg=\"; _pinterest_sess=TWc9PSZHamJOZ0JobUFiSEpSN3Z4a2NsMk9wZ3gxL1NSc2k2NkFLaUw5bVY5cXR5alZHR0gxY2h2MVZDZlNQalNpUUJFRVR5L3NlYy9JZkthekp3bHo5bXFuaFZzVHJFMnkrR3lTbm56U3YvQXBBTW96VUgzVUhuK1Z4VURGKzczUi9hNHdDeTJ5Y2pBTmxhc2owZ2hkSGlDemtUSnYvVXh5dDNkaDN3TjZCTk8ycTdHRHVsOFg2b2NQWCtpOWxqeDNjNkk3cS85MkhhSklSb0hwTnZvZVFyZmJEUllwbG9UVnpCYVNTRzZxOXNJcmduOVc4aURtM3NtRFo3STlmWjJvSjlWTU5ITzg0VUg1NGhOTEZzME9SNFNhVWJRWjRJK3pGMFA4Q3UvcHBnWHdaYXZpa2FUNkx6Z3RNQjEzTFJEOHZoaHRvazc1c1UrYlRuUmdKcDg3ZEY4cjNtZlBLRTRBZjNYK0lPTXZJTzQ5dU8ybDdVS015bWJKT0tjTWYyRlBzclpiamdsNmtpeUZnRjlwVGJXUmdOMXdTUkFHRWloVjBMR0JlTE5YcmhxVHdoNzFHbDZ0YmFHZ1VLQXU1QnpkM1FqUTNMTnhYb3VKeDVGbnhNSkdkNXFSMXQybjRGL3pyZXRLR0ZTc0xHZ0JvbTJCNnAzQzE0cW1WTndIK0trY05HV1gxS09NRktadnFCSDR2YzBoWmRiUGZiWXFQNjcwWmZhaDZQRm1UbzNxc21pV1p5WDlabm1UWGQzanc1SGlrZXB1bDVDWXQvUis3elN2SVFDbm1DSVE5Z0d4YW1sa2hsSkZJb1h0MTFpck5BdDR0d0lZOW1Pa2RDVzNySWpXWmUwOUFhQmFSVUpaOFQ3WlhOQldNMkExeDIvMjZHeXdnNjdMYWdiQUhUSEFBUlhUVTdBMThRRmh1ekJMYWZ2YTJkNlg0cmFCdnU2WEpwcXlPOVZYcGNhNkZDd051S3lGZmo0eHV0ZE42NW8xRm5aRWpoQnNKNnNlSGFad1MzOHNkdWtER0xQTFN5Z3lmRERsZnZWWE5CZEJneVRlMDd2VmNPMjloK0g5eCswZUVJTS9CRkFweHc5RUh6K1JocGN6clc1JmZtL3JhRE1sc0NMTFlpMVErRGtPcllvTGdldz0=; _ir=0"
		}
			}).then(({ data }) => {
		const $ = cheerio.load(data)
		const result = [];
		const hasil = [];
   		 $('div > a').get().map(b => {
        const link = $(b).find('img').attr('src')
            result.push(link)
		});
   		result.forEach(v => {
		 if(v == undefined) return
		 hasil.push(v.replace(/236/g,'736'))
			})
		hasil.shift();
		resolve(hasil)
		console.log(hasil)
		})
	})
}

function katabijak() {
    return new Promise((resolve, reject) => {
        let page = Math.floor(Math.random() * 5)
        let url = ["https://jagokata.com/kata-bijak/kata-meninggal.html","https://jagokata.com/kata-bijak/kata-sabar.html","https://jagokata.com/kata-bijak/kata-pernikahan.html","https://jagokata.com/kata-bijak/kata-matahari.html","https://jagokata.com/kata-bijak/kata-mimpi.html","https://jagokata.com/kata-bijak/kata-bahagia.html","https://jagokata.com/kata-bijak/kata-cinta.html","https://jagokata.com/kata-bijak/kata-kebebasan.html","https://jagokata.com/kata-bijak/kata-sendiri.html","https://jagokata.com/kata-bijak/kata-uang.html","https://jagokata.com/kata-bijak/kata-manusia.html","https://jagokata.com/kata-bijak/kata-kebijaksanaan.html","https://jagokata.com/kata-bijak/kata-alam.html"]
        let baseUrl = url[Math.floor(Math.random() *url.length)]
        axios.get(baseUrl+'?page='+page)
        .then(({ data }) => {
            let $ = cheerio.load(data)
            let hasil = []
            $('#citatenrijen > li').each(function (a, b) {
                hasil.push({
                    author: {
                        name: $(b).find('div.citatenlijst-auteur > a').text(),
                        detail: $(b).find('div.citatenlijst-auteur > a').attr('href'),
                        profile_pic: $(b).find('img').attr('src')
                    },
                    quotes: $(b).find('q.fbquote').text(),
                    original: $(b).find('div.citatenlijst-oorspronkelijk > div > q').text() || '',
                    source: 'https://'+$(b).find('div.citaatopties > div.images-container > a').attr('href')
                })
            })
            resolve(hasil)
        })
    })
}

function peribahasa(q) {
    return new Promise((resolve, reject) => {
        axios.get(`https://jagokata.com/peribahasa/${q}.html`)
        .then(({ data }) => {
            let $ = cheerio.load(data)
            let menggunakan = []
            let penggunaan = []
            $('#arti-kata > ul > li').each(function (a, b) {
                menggunakan.push({ peribahasa: $(b).text().split('=')[0], pengertian: $(b).text().split('=')[1] })
            })
            $('#arti-kata > i > ul > li').each(function (a, b) {
                penggunaan.push({ peribahasa: $(b).text().split('=')[0], pengertian: $(b).text().split('=')[1] })
            })
            resolve({ menggunakan, penggunaan })
        })
    })
}

function cerpen(category) {
    return new Promise((resolve, reject) => {
        let title = category.toLowerCase()
        let judul = title.replace(/\s/g, "-")
        let page = Math.floor(Math.random() * 5)
        axios.get('http://cerpenmu.com/category/cerpen-'+judul+'/page/'+page)
        .then((get) => {
            let $ = cheerio.load(get.data)
            let link = []
            $('article.post').each(function (a, b) {
                link.push($(b).find('a').attr('href'))
            })
            let random = link[Math.floor(Math.random() * link.length)]
            axios.get(random)
            .then((res) => {
                let $$ = cheerio.load(res.data)
                let hasil = {
                    title: $$('#content > article > h1').text(),
                    author: $$('#content > article').text().split('Cerpen Karangan: ')[1].split('Kategori: ')[0],
                    kategori: $$('#content > article').text().split('Kategori: ')[1].split('\n')[0],
                    lolos: $$('#content > article').text().split('Lolos moderasi pada: ')[1].split('\n')[0],
                    cerita: $$('#content > article > p').text()
                }
                resolve(hasil)
            })
        })
    })
}

function npmStalk(package) {
    return new Promise((resolve, reject) => {
        axios.get('https://npmjs.com/package/'+package)
        .then(({ data }) => {
            let $ = cheerio.load(data)
            let keywords = []
            let info = []
            let collaborator = []
            $('#tabpanel-readme > div.pv4 > ul > li').each(function (a, b) {
                keywords.push($(b).text())
            })
            $('div._702d723c.dib.w-50.bb.b--black-10.pr2').each(function (a, b) {
                info.push({ type: $(b).find('h3').text(), result: $(b).find('p').text() || $(b).find('a').text() })
            })
            $('#top > div.fdbf4038.w-third-l.mt3.w-100.ph3.ph4-m.pv3.pv0-l > div.w-100 > ul > li').each(function (a, b) {
                collaborator.push({ name: $(b).find('a').attr('href').replace('/~', ''), url: 'https://www.npmjs.com'+$(b).find('a').attr('href') })
            })
            let hasil = {
                title: $('#top > div.w-100.ph0-l.ph3.ph4-m > h2 > span').text(),
                language: $('#top > div.w-100.ph0-l.ph3.ph4-m > h2 > div').text() || 'Default',
                publish: $('#top > div.w-100.ph0-l.ph3.ph4-m > span:nth-child(4)').text(),
                readme: $('#readme').text() || '',
                explore: $('#package-tab-explore > span').text().replace(' Explore ', '') || '',
                dependencies: $('#package-tab-dependencies > span').text().replace(' Dependencies', '') || '',
                dependents: $('#package-tab-dependents > span').text().replace(' Dependents', '') || '',
                version_count: $('#package-tab-versions > span').text().replace(' Versions', '') || '',
                keywords: keywords || [],
                install: $('#top > div.fdbf4038.w-third-l.mt3.w-100.ph3.ph4-m.pv3.pv0-l > p > code > span').text(),
                info,
                collaborator
            }
            resolve(hasil)
        })
    })
}

function twitterStalk(user) {
    return new Promise((resolve, reject) => {
        axios.get('https://instalker.org/'+user)
        .then(({ data }) => {
            let $ = cheerio.load(data)
            let tweets = []
            $('div.activity-posts').each(function (a, b) {
                tweets.push({
                    author: {
                        username: $(b).find('div.user-text3 > h4 > span').text(),
                        nickname: $(b).find('div.user-text3 > h4').text().split('@')[0] || $(b).find('div.user-text3 > h4').text().trim(),
                        profile_pic: $(b).find('img').attr('src') || $(b).find('img').attr('onerror'),
                        upload_at: $(b).find('div.user-text3 > span').text()
                    },
                    title: $(b).find('div.activity-descp > p').text() || '',
                    media: $(b).find('div.activity-descp > div > a').attr('href') || $(b).find('div.activity-descp > p > video').attr('src') || $(b).find('div.activity-descp > div > a > img').attr('src') || $(b).find('div.activity-descp > div > a > video').attr('src') || 'No Media Upload',
                    retweet: $(b).find('div.like-comment-view > div > a:nth-child(1) > span').text().replace('Download Image', ''),
                    likes: $(b).find('div.like-comment-view > div > a:nth-child(2) > span').text()
                })
            })
            let hasil = {
                username: $('body > main > div.dash-dts > div > div > div:nth-child(1) > div > div > h3 > span').text(),
                nickname: $('body > main > div.dash-dts > div > div > div:nth-child(1) > div > div > h3').text().split('@')[0] || $('body > main > div.dash-dts > div > div > div:nth-child(1) > div > div > h3').text(),
                background: $('body > main > div.dash-todo-thumbnail-area1 > div.todo-thumb1.dash-bg-image1.dash-bg-overlay').attr('style').split('url(')[1].split(')')[0],
                profile: $('body > main > div.dash-todo-thumbnail-area1 > div.dash-todo-header1 > div > div > div > div > div > a > img').attr('src') || $('body > main > div.dash-todo-thumbnail-area1 > div.dash-todo-header1 > div > div > div > div > div > a').attr('href'),
                desc_text: $('body > main > div.dash-dts > div > div > div:nth-child(1) > div > div > span:nth-child(2)').text() || '',
                join_at: $('body > main > div.dash-dts > div > div > div:nth-child(1) > div > div > span:nth-child(3)').text() || $('body > main > div.dash-dts > div > div > div:nth-child(1) > div > div > span:nth-child(5)').text(),
                map: $('body > main > div.dash-dts > div > div > div:nth-child(1) > div > div > span:nth-child(4)').text() || '',
                tweets_count: $('body > main > div.dash-dts > div > div > div:nth-child(2) > ul > li:nth-child(1) > div > div.dscun-numbr').text(),
                followers: $('body > main > div.dash-dts > div > div > div:nth-child(2) > ul > li:nth-child(2) > div > div.dscun-numbr').text(),
                following: $('body > main > div.dash-dts > div > div > div:nth-child(2) > ul > li:nth-child(3) > div > div.dscun-numbr').text(),
                media_count: tweets.length,
                media: tweets || 'No Media Upload'
            }
            resolve(hasil)
        })
    })
}

function tgstat(user) {
    return new Promise((resolve, reject) => {
        let User = user.startsWith('@') ? user : '@' + user
        axios({
            url: 'https://in.tgstat.com/channel/'+User,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
                'cookie': '_ga=GA1.2.2145921501.1640416771; _gat=1; _gid=GA1.2.1701284558.1640416771; _ym_d=1640416774; _yn_uid=1640416774851926759; tgstat_sirk=se5opc311gme57h03vl7q72r44'
            }
        }).then(({ data }) => {
            let $ = cheerio.load(data)
            let hasil = {
                nickname: $('div.small-12.medium-5.large-5.columns > h1').text(),
                username: $('div.small-12.medium-5.large-5.columns > a:nth-child(3) > span:nth-child(2)').text(),
                channel_url: $('div.small-12.medium-5.large-5.columns > a:nth-child(3)').attr('href'),
                likes: $('div.small-12.medium-5.large-5.columns > a.btn.btn-default.btn-sm.btn-heart.not-hover.popup_ajax > span').text().replace('Like', ''),
                description: $('div.small-12.medium-5.large-5.columns > div:nth-child(8)').text().trim(),
                channel_geo_lang: $('div.medium-4.large-4.columns.hide-for-small-only > div:nth-child(1) > div:nth-child(1)').text().replace(`Channel's geo & Language`, '').trim(),
                channel_category: $('div.medium-4.large-4.columns.hide-for-small-only > div:nth-child(1) > div:nth-child(2)').text().replace('Category', '').trim(),
                members: $('body > div.wrap > div > div.row.margin-top15.small-no-padding > div:nth-child(1) > div > div:nth-child(1)').text().trim(),
                post_reach: $('body > div.wrap > div > div.row.margin-top15.small-no-padding > div:nth-child(2) > div > div:nth-child(1)').text().trim(),
                daily_reach: $('body > div.wrap > div > div.row.margin-top15.small-no-padding > div:nth-child(3) > div > div:nth-child(1)').text().trim(),
                post_per_day: $('body > div.wrap > div > div.row.margin-top15.small-no-padding > div:nth-child(4) > div > div:nth-child(1)').text().trim(),
                err: $('body > div.wrap > div > div.row.margin-top15.small-no-padding > div:nth-child(5) > div > div:nth-child(1)').text(),
                citation_index: $('body > div.wrap > div > div.row.margin-top15.small-no-padding > div:nth-child(6) > div > div:nth-child(1)').text(),
                mentions_of_channel: $('div.columns.large-4.medium-12.small-12 > b').text(),
                post_mentions: $('div.columns.large-5.medium-12.small-12 > b').text(),
                forwards: $('div.columns.large-3.medium-12.small-12 > b').text(),
                profile_pic: 'https:'+$('body > div.wrap > div > div.row.small-collapse.medium-uncollapse.sticky-canceller-container.margin-bottom15 > div.small-12.medium-3.large-3.columns > div > img').attr('data-src') || $("meta[property='og:image']").attr('content')
            }
            resolve(hasil)
        })
    })
}

function ringtone(title) {
    return new Promise((resolve, reject) => {
        axios.get('https://meloboom.com/en/search/'+title)
        .then((get) => {
            let $ = cheerio.load(get.data)
            let hasil = []
            $('#__next > main > section > div.jsx-2244708474.container > div > div > div > div:nth-child(4) > div > div > div > ul > li').each(function (a, b) {
                hasil.push({ title: $(b).find('h4').text(), source: 'https://meloboom.com/'+$(b).find('a').attr('href'), audio: $(b).find('audio').attr('src') })
            })
            resolve(hasil)
        })
    })
}

function igdl(url) {
    return new Promise((resolve, reject) => {
        axios({
            url: 'https://www.w3toys.com/reels/?',
            method: 'POST',
            headers: {
                "user-agent": "Mozilla/5.0 (Linux; Android 10; RMX2020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Mobile Safari/537.36"
            },
            data: new URLSearchParams(Object.entries({ 'link': url, 'submit': 'DOWNLOAD' }))
        }).then(({ data }) => {
            let $ = cheerio.load(data)
            let array = []
            let dl = []
            $('#body > section > div > div > div > form > div.dlsection > a').each(function(a, b) {
                array.push($(b).attr('href'))
            })
            $('#body > section > div > div > div > form > div.dlsection > img').each(function(a, b) {
                dl.push($(b).attr('src'))
            })
            resolve(array || dl)
        })
    })
}

function quotesAnime() {
    return new Promise((resolve, reject) => {
        const page = Math.floor(Math.random() * 184)
        axios.get('https://otakotaku.com/quote/feed/'+page)
        .then(({ data }) => {
            const $ = cheerio.load(data)
            const hasil = []
            $('div.kotodama-list').each(function(l, h) {
                hasil.push({
                    link: $(h).find('a').attr('href'),
                    gambar: $(h).find('img').attr('data-src'),
                    karakter: $(h).find('div.char-name').text().trim(),
                    anime: $(h).find('div.anime-title').text().trim(),
                    episode: $(h).find('div.meta').text(),
                    up_dat: $(h).find('small.meta').text(),
                    quotes: $(h).find('div.quote').text().trim()
                })
            })
            resolve(hasil)
        }).catch(reject)
    })
}

const mediafire = async (url) => {
const res = await axios.get(url) 
const $ = cheerio.load(res.data)
const hasil = []
const link = $('a#downloadButton').attr('href')
const size = $('a#downloadButton').text().replace('Download', '').replace('(', '').replace(')', '').replace('\n', '').replace('\n', '').replace('                         ', '')
const seplit = link.split('/')
const nama = seplit[5]
mime = nama.split('.')
mime = mime[1]
hasil.push({ nama, mime, size, link })
return hasil
}

module.exports = { gempa,
covid,
upload,
tiktoksearch,
linkwa,
trendtwit,
igstalk,
webp2gifFile,
playstore,
wiki,
artinama,
merdeka,
pinterest,
quotesAnime,
mediafire }
