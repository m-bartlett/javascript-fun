document.addEventListener('DOMContentLoaded', () => {
    //<Standard canvas management>////////////////////////
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext('2d');
    canvas.resize = function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    canvas.resize();
    window.addEventListener('resize', canvas.resize, false);
    //</Standard canvas management>///////////////////////

    // canvas.addEventListener('mousedown', function(event) {})
    
    var walker = new Walker();

    //Draw is now a self-invoking function, it will start automagically once the DOM loads it.
    (function draw() {
        //if score <= 0, clear canvas + give Game Over screen
            ctx.save();
            ctx.save();
            ctx.globalAlpha = 0.15;
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = '#FFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();

            //Draw the only tree
            ctx.translate(0, canvas.height / 2);
            walker.render();
            ctx.restore();
            window.requestAnimationFrame(draw);
    })();

    var decay = 0.01, 
    
    function Walker(size) {
        // generation++;
        var sway = 0,
            growth = 0,
            hue = random(0, 360),
            _col = 'hsl(' + hue + ',100%,' + lum + '%)',
            _x = size * Math.cos(rotation) * Math.sign(rotation),
            _y = size * Math.sin(rotation);


        // this.children = [];
        // if (size > size_m) this.children.push(new Branch(size * 0.81, deg)), this.children.push(new Branch(size * random(0.7, 0.9), -deg));

        this.render = function(col) {
            ctx.save();

            var grad = ctx.createLinearGradient(0, 0, 0, -size * growth);
            grad.addColorStop(1, String(_col));
            grad.addColorStop(0, String(col || "white"));
            ctx.strokeStyle = grad;
            hue += random(1, 3);
            _col = 'hsl(' + hue + ',100%,' + lum + '%)';
            ctx.beginPath();
            ctx.lineWidth = size * 0.075 * growth;
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -size * growth);
            ctx.stroke();

            // var _x = Math.round(size * Math.cos(rotation/2) * Math.sign(rotation)),
            // _y = Math.round(size * Math.sin(rotation/2));
            // 

            //Print net angle next to respective branch
            // ctx.font = (size*growth/3) + "px monospace"
            // ctx.fillText((Math.round(100*net_rot)), 0, -size*growth/2);


            ctx.translate(0, -size * growth);
            for (var i = 0; i < this.children.length; i++) this.children[i].render(_col);

            net_rot -= rot;
            ctx.restore();
            sway += swaySpeed;
            if (delay > 0) delay--;
            else growth += (1 - growth) * 0.1;
        }
        generation--;
    }

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }
})