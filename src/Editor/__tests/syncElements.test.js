import React from "react"
import renderDOM from "lib/renderDOM"

import {
	replaceAttributes,
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
