/**
 * ijslt - Inigo's JSLT implementation.
 * 
 * Inspired by Robin Berjon's JSLT example at XML Prague 2012
 * for transforming XML in the browser with XSLT-like JavaScript.
 * 
 * Copyright (C) 2010 Inigo Surguy
 * Released under the LGPL - http://www.gnu.org/licenses/lgpl.html
 *
 */
(function($){ 
    
    var rules = new Array();
    var inputDoc;

    function addTemplate(pattern, action, priority) {
        if (!priority) priority = 0;
        rules.push( { pattern: pattern, action: action, priority: priority } );
    }

    function addDefaultTemplates() {
        addTemplate("*",function(context, apply) { return apply(context); }, -50);
    }

    function bestMatch(node) { 
        var bestPriority = -100;
        var bestMatch = null;
        for (i in rules) {
            var rule = rules[i];
            // @todo Inefficient - should precalculate matching nodes, they're not going to change
            // @todo Could implement modes here via multiple sets of matchingNodes lookups
            var matchingNodes = inputDoc.find(rule.pattern);
            if ((matchingNodes.index(node) > -1) && (rule.priority > bestPriority)) {
                bestPriority = rule.priority;
                bestMatch = rule;
            }
        }
        return bestMatch;
    }

    function applyTemplates(input) {
        var jqInput = $(input);
        var ic = input[0].childNodes;
        var results = "";
        for (i in input[0].childNodes) {
            var child = input[0].childNodes[i];
            var x = $(child);
            var rule = bestMatch(x);
            // @todo more robust checking for text nodes - should allow a fn to act on text
            if (rule) {
                console.log("Best rule is "+rule.pattern+" for "+x.localName);
                var result =  rule.action(x, function(newNode) { 
                    console.log(newNode);
                    return applyTemplates(newNode); 
                });
                results += result;
            } else {
                console.log("text : "+child.textContent);
                results += child.textContent;
            }
        }
        return results;
    }

	$.fn.template = function(rule, action, priority) {  
        addTemplate(rule, action, priority);
        return this;
    },
    $.fn.transform = function() {
        addDefaultTemplates();
        inputDoc = this;
        var results = applyTemplates(inputDoc);
        var output = $("<root/>");
        $(results).each(function(i, result) { output.append(result); });
        return output;
    }
})(jQuery);
