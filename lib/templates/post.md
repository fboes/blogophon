---
{{#if draft}}
Draft:     true # Remove this line to undraft this article
{{/if}}
Date:      {{#ymlQuote}}{{{date}}}{{/ymlQuote}}
{{#if tags}}
Tags:      {{#ymlQuote}}{{{tags}}}{{/ymlQuote}}
{{/if}}
{{#if category}}
Category:  {{#ymlQuote}}{{{category}}}{{/ymlQuote}}
{{/if}}
{{#if classes}}
Classes:   {{#ymlQuote}}{{{classes}}}{{/ymlQuote}}
{{/if}}
{{#if author}}
Author:    {{#ymlQuote}}{{{author}}}{{/ymlQuote}}
{{/if}}
{{#unless isMicropost}}
Twitter:   {{#ymlQuote}}{{{title}}}{{/ymlQuote}}
{{/unless}}
{{#if location}}
Location:  {{#ymlQuote}}{{{location}}}{{/ymlQuote}}
{{/if}}
{{#if latitude}}
Marker:    marker
Latitude:  {{#ymlQuote}}{{{latitude}}}{{/ymlQuote}}
Longitude: {{#ymlQuote}}{{{longitude}}}{{/ymlQuote}}
{{/if}}
{{#if rating}}
Rating:    {{#ymlQuote}}{{rating}}/5{{/ymlQuote}}
{{/if}}
{{#if link}}
Link:      {{#ymlQuote}}{{{link}}}{{/ymlQuote}}
{{/if}}
---

{{#unless isMicropost}}
{{{title}}}
=========

{{#if lead}}
{{{lead}}}

***

{{/if}}
{{/unless}}
{{{mainText}}}
