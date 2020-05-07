import React from "react"
import renderDOM from "lib/renderDOM"

import {
	replaceAttributes,
	syncElements,
	syncNodes,
} from "../syncElements"

describe("replaceAttributes", () => {
	test("", () => {
		const src = renderDOM(<div />)
		const dst = renderDOM(<div />)
		replaceAttributes(src, dst)
		expect(dst.outerHTML).toBe(src.outerHTML)
	})
	test("", () => {
		const src = renderDOM(<div className="a" />)
		const dst = renderDOM(<div />)
		replaceAttributes(src, dst)
		expect(dst.outerHTML).toBe(src.outerHTML)
	})
	test("", () => {
		const src = renderDOM(<div />)
		const dst = renderDOM(<div className="a" />)
		replaceAttributes(src, dst)
		expect(dst.outerHTML).toBe(src.outerHTML)
	})
	test("", () => {
		const src = renderDOM(<div className="a" />)
		const dst = renderDOM(<div className="a" />)
		replaceAttributes(src, dst)
		expect(dst.outerHTML).toBe(src.outerHTML)
	})
	test("", () => {
		const src = renderDOM(<div className="a b c" />)
		const dst = renderDOM(<div className="a" />)
		replaceAttributes(src, dst)
		expect(dst.outerHTML).toBe(src.outerHTML)
	})
	test("", () => {
		const src = renderDOM(<div className="a" />)
		const dst = renderDOM(<div className="a b c" />)
		replaceAttributes(src, dst)
		expect(dst.outerHTML).toBe(src.outerHTML)
	})
	test("", () => {
		const src = renderDOM(<div className="a b c" />)
		const dst = renderDOM(<div className="a b c" />)
		replaceAttributes(src, dst)
		expect(dst.outerHTML).toBe(src.outerHTML)
	})
	test("", () => {
		const src = renderDOM(<div id="hello-world" className="a b c" />)
		const dst = renderDOM(<div className="a b c" tabIndex="0" />)
		replaceAttributes(src, dst)
		// NOTE: Use an ES6 map to compare output because
		// outerHTML breaks because of order and ES6 maps are
		// sorted

		// const srcMap = new Map()
		// const dstMap = new Map()
		// ;[...src.attributes].map(each => srcMap.set(each.nodeName, each.nodeValue)
		// ;[...dst.attributes].map(eahc => dstMap.set(each.nodeName, each.nodeValue)

		const srcMap = new Map()
		for (const each of [...src.attributes]) {
			srcMap.set(each.nodeName, each.nodeValue)
		}
		const dstMap = new Map()
		for (const each of [...dst.attributes]) {
			dstMap.set(each.nodeName, each.nodeValue)
		}
		// NOTE: outerHTML breaks because of order
		expect(srcMap).toStrictEqual(dstMap)
	})
	test("", () => {
		const dst = renderDOM(<div className="a b c" tabIndex="0" />)
		const src = renderDOM(<div id="hello-world" className="a b c" />)
		replaceAttributes(src, dst)
		// NOTE: Use an ES6 map to compare output because
		// outerHTML breaks because of order and ES6 maps are
		// sorted
		const srcMap = new Map()
		for (const each of [...src.attributes]) {
			srcMap.set(each.nodeName, each.nodeValue)
		}
		const dstMap = new Map()
		for (const each of [...dst.attributes]) {
			dstMap.set(each.nodeName, each.nodeValue)
		}
		// NOTE: outerHTML breaks because of order
		expect(srcMap).toStrictEqual(dstMap)
	})
})

describe("syncNodes", () => {
	// Text nodes:
	test("", () => {
		const src = document.createTextNode("")
		const dst = document.createTextNode("")
		syncNodes(src, dst)
		expect(dst.isEqualNode(src)).toBe(true)
	})
	test("", () => {
		const src = document.createTextNode("hello, world!")
		const dst = document.createTextNode("")
		syncNodes(src, dst)
		expect(dst.isEqualNode(src)).toBe(true)
	})
	test("", () => {
		const src = document.createTextNode("")
		const dst = document.createTextNode("hello, world!")
		syncNodes(src, dst)
		expect(dst.isEqualNode(src)).toBe(true)
	})
	test("", () => {
		const src = document.createTextNode("hello, world!")
		const dst = document.createTextNode("hello, world!")
		syncNodes(src, dst)
		expect(dst.isEqualNode(src)).toBe(true)
	})
	// Elements:
	test("", () => {
		const src = renderDOM(<div />)
		const dst = renderDOM(<div />)
		syncNodes(src, dst)
		expect(dst.isEqualNode(src)).toBe(true)
	})
	test("", () => {
		const src = renderDOM(<div className="a b c" />)
		const dst = renderDOM(<div />)
		syncNodes(src, dst)
		expect(dst.isEqualNode(src)).toBe(true)
	})
	test("", () => {
		const src = renderDOM(<div />)
		const dst = renderDOM(<div className="a b c" />)
		syncNodes(src, dst)
		expect(dst.isEqualNode(src)).toBe(true)
	})
	test("", () => {
		const src = renderDOM(<div className="a b c" />)
		const dst = renderDOM(<div className="a b c" />)
		syncNodes(src, dst)
		expect(dst.isEqualNode(src)).toBe(true)
	})
	// Elements and text nodes:
	//
	// NOTE: Use childNodes[0] so we can compare the new
	// reference
	//
	// const clonedElement = src.cloneNode(true)
	// dst.replaceWith(clonedElement)
	//
	test("", () => {
		const src = renderDOM((
			<div>
				<div />
			</div>
		))
		const dst = renderDOM((
			<div>
				<p />
			</div>
		))
		syncNodes(src.childNodes[0], dst.childNodes[0])
		expect(dst.isEqualNode(src)).toBe(true)
	})
	test("", () => {
		const dst = renderDOM((
			<div>
				<p />
			</div>
		))
		const src = renderDOM((
			<div>
				<div />
			</div>
		))
		syncNodes(src.childNodes[0], dst.childNodes[0])
		expect(dst.isEqualNode(src)).toBe(true)
	})
	test("", () => {
		const src = renderDOM((
			<div>
				<div />
			</div>
		))
		const dst = renderDOM((
			<div>
				hello, world!
			</div>
		))
		syncNodes(src.childNodes[0], dst.childNodes[0])
		expect(dst.isEqualNode(src)).toBe(true)
	})
	test("", () => {
		const src = renderDOM((
			<div>
				hello, world!
			</div>
		))
		const dst = renderDOM((
			<div>
				<div />
			</div>
		))
		syncNodes(src.childNodes[0], dst.childNodes[0])
		expect(dst.isEqualNode(src)).toBe(true)
	})
})

describe("syncElements", () => {
	test("", () => {
		const src = renderDOM((
			<div>
				{/* ... */}
			</div>
		))
		const dst = renderDOM((
			<div>
				{/* ... */}
			</div>
		))
		syncElements(src, dst)
		expect(dst.isEqualNode(src)).toBe(true)
	})
	test("", () => {
		const src = renderDOM((
			<div>
				hello, world!
			</div>
		))
		const dst = renderDOM((
			<div>
				{/* ... */}
			</div>
		))
		syncElements(src, dst)
		expect(dst.isEqualNode(src)).toBe(true)
	})
	// test("", () => {
	// 	const src = renderDOM((
	// 		<div>
	// 			{/* ... */}
	// 		</div>
	// 	))
	// 	const dst = renderDOM((
	// 		<div>
	// 			hello, world!
	// 		</div>
	// 	))
	// 	syncElements(src, dst)
	// 	expect(dst.isEqualNode(src)).toBe(true)
	// })
	// test("", () => {
	// 	const src = renderDOM((
	// 		<div>
	// 			hello, world!
	// 		</div>
	// 	))
	// 	const dst = renderDOM((
	// 		<div>
	// 			hello, world!
	// 		</div>
	// 	))
	// 	syncElements(src, dst)
	// 	expect(dst.isEqualNode(src)).toBe(true)
	// })
	// test("", () => {
	// 	const src = renderDOM((
	// 		<div>
	// 			<div>
	// 				hello, world!
	// 			</div>
	// 		</div>
	// 	))
	// 	const dst = renderDOM((
	// 		<div>
	// 			hello, world!
	// 		</div>
	// 	))
	// 	syncElements(src, dst)
	// 	expect(dst.isEqualNode(src)).toBe(true)
	// })
})

// src:
// <div>
// 	<a />
// 	<div>
// 		<b />
// 	</div>
// </div>
//
// dst:
// <div>
// 	<div>
// 		<b />
// 	</div>
// 	<a />
// </div>
