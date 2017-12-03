document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext('2d');
    var cy = canvas.height / 2;
    var cx = canvas.width / 2;

    canvas.resize = function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        cy = canvas.height / 2;
        cx = canvas.width / 2;

    }
    canvas.resize();
    window.addEventListener('resize', canvas.resize, false);


    var pi = Math.PI;

    var _tree = {};
    var _splits = 2;
    var _depth = 9;
    var bulbs = Math.pow(_splits, _depth)

    var cameraX = Math.sin(pi / _splits) * 55;
    var cameraZ = Math.cos(pi / _splits) * 55;
    var cameraY = -10;
    var pitch = 0;
    var yaw = 0;
    var scale = 600;
    var treeSize = 20;
    var seed = 1;
    var frames = 600;



    function addBranches(branch, splits, depth, angle) {

        branch.branches = [];
        branch.length /= 1.575 / growth
        if (branch.depth > depth) return;
        for (var m = 0; m < splits; ++m) {
            var x1 = branch.x2,
                y1 = branch.y2,
                z1 = branch.z2,
                // p1 = pi * 2 / splits * m + frames / 60,
                p1 = pi * 2 / splits * m + ((pi - 0.001) / 2.001 * (Math.sin(pi * frames / 360) + 1.001))
                // p1 = pi * 2 / splits * m + (branch.depth > 1 ? frames / 60 : 0),
                // p1 = pi * 2 / splits * m + (branch.depth > 1 ? (branch.depth % 2 ? frames / 60 : -frames / 60) : 0),
                // p1 = pi * 2 / splits * m + (branch.depth % 2 ? frames / 60 : -frames / 60),
            p2 = pi + angle,
                x2 = Math.sin(p1) * Math.sin(p2) * branch.length, // / 1.65,
                y2 = Math.cos(p2) * branch.length, // / 1.65,
                z2 = Math.cos(p1) * Math.sin(p2) * branch.length, // / 1.65,
                p = Math.atan2(y2, z2),
                d = Math.sqrt(y2 * y2 + z2 * z2),
                y2 = y1 - Math.sin(p + branch.p2) * d,
                z2 = Math.cos(p + branch.p2) * d,
                p = Math.atan2(x2, z2),
                d = Math.sqrt(x2 * x2 + z2 * z2),
                x2 = x1 + Math.sin(p + branch.p1) * d,
                z2 = z1 + Math.cos(p + branch.p1) * d,
                newBranch = {
                    x1: x1,
                    y1: y1,
                    z1: z1,
                    x2: x2,
                    y2: y2,
                    z2: z2,
                    p1: Math.atan2(x2 - x1, z2 - z1),
                    p2: elevation(x2 - x1, z2 - z1, y2 - y1),
                    length: branch.length, // / 1.65,
                    depth: branch.depth + 1
                };
            branch.branches.push(newBranch);
            addBranches(newBranch, splits, depth, angle);
        }
    }

    function spawnTree(x, y, z, splits, depth, angle) {

        var tree = {};
        tree.branches = [];
        tree.splits = splits;
        tree.height = depth;
        branch = {
            x1: x,
            y1: y,
            z1: z,
            p1: 0,
            p2: pi,
            length: treeSize * growth,
            depth: 1
        };
        branch.x2 = branch.x1
            // branch.x2 = branch.x1 + Math.sin(branch.p1) * Math.sin(branch.p2) * branch.length;
        branch.y2 = branch.y1 - branch.length;
        // branch.z2 = branch.z1 + Math.cos(branch.p1) * Math.sin(branch.p2) * branch.length;
        branch.z2 = branch.z1

        tree.branches.push(branch);
        addBranches(tree.branches[0], splits, depth, angle);
        return tree;
    }

    function rasterizePoint(x, y, z) {

        var p, d;
        x -= cameraX;
        y -= cameraY;
        z -= cameraZ;
        p = Math.atan2(x, z);
        d = Math.sqrt(x * x + z * z);
        x = Math.sin(p - yaw) * d;
        z = Math.cos(p - yaw) * d;
        p = Math.atan2(y, z);
        d = Math.sqrt(y * y + z * z);
        y = Math.sin(p - pitch) * d;
        z = Math.cos(p - pitch) * d;
        var rx1 = -1000;
        var ry1 = 1;
        var rx2 = 1000;
        var ry2 = 1;
        var rx3 = 0;
        var ry3 = 0;
        var rx4 = x;
        var ry4 = z;
        var uc = (ry4 - ry3) * (rx2 - rx1) - (rx4 - rx3) * (ry2 - ry1);
        if (!uc) return {
            x: 0,
            y: 0,
            d: -1
        };
        var ua = ((rx4 - rx3) * (ry1 - ry3) - (ry4 - ry3) * (rx1 - rx3)) / uc;
        var ub = ((rx2 - rx1) * (ry1 - ry3) - (ry2 - ry1) * (rx1 - rx3)) / uc;
        if (!z) z = 0.000000001;
        if (ua > 0 && ua < 1 && ub > 0 && ub < 1) {
            return {
                x: cx + (rx1 + ua * (rx2 - rx1)) * scale,
                y: cy + y / z * scale,
                d: Math.sqrt(x * x + y * y + z * z)
            };
        } else {
            return {
                x: cx + (rx1 + ua * (rx2 - rx1)) * scale,
                y: cy + y / z * scale,
                d: -1
            };
        }
    }

    function elevation(x, y, z) {

        var dist = Math.sqrt(x * x + y * y + z * z);
        if (dist && z / dist >= -1 && z / dist <= 1) return Math.acos(z / dist);
        return 0.00000001;
    }

    function doLogic() {

        p = Math.atan2(cameraX, cameraZ);
        d = Math.sqrt(cameraX * cameraX + cameraZ * cameraZ);
        d -= Math.sin(frames / 50) / 1.15;
        t = Math.sin(frames / 160) / 40;
        // cameraX = Math.sin(frames / 100) * 55;
        // cameraZ = Math.cos(frames / 100) * 55;
        // cameraY -= Math.cos(frames / 80) / 2;
        yaw = pi + p + t;
        pitch = elevation(cameraX, cameraZ, cameraY) - pi / 1.825;

        // while (trees.length) trees.splice(0, 1);
        // angle = (Math.sin(frames / 240) + 1) * 2.5 * pi / 12 + pi / 12
        angle = (Math.sin(frames / 230) + 1) * pi / 6 + pi / 6
            // angle = pi / 4
        splits = _splits;
        depth = _depth;
        _tree = spawnTree(0, 25, 0, splits, depth, angle);
    }

    function drawFloor() {

        ctx.globalAlpha = 0.2;
        ctx.fillStyle = "#163";
        for (i = -200; i <= 200; i += 5) {
            for (j = -200; j <= 200; j += 5) {
                x = i;
                z = j;
                y = 25;
                point = rasterizePoint(x, y, z);
                if (point.d != -1) {
                    size = 500 / (1 + point.d);
                    d = Math.sqrt(x * x + z * z);
                    a = 0.75 - Math.pow(d / 200, 6) * 0.75;
                    if (a > 0) {
                        ctx.globalAlpha = a;
                        ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
                    }
                }
            }
        }
    }

    function drawBranches(branch) {

        point1 = rasterizePoint(branch.x1, branch.y1, branch.z1);
        point2 = rasterizePoint(branch.x2, branch.y2, branch.z2);
        if (point1.d != -1 && point2.d != -1) {
            // ctx.lineWidth = 1
            ctx.lineWidth = (_tree.height - branch.depth + 1) * 1.65
            ctx.lineWidth *= growth
            ctx.beginPath();
            // ctx.strokeStyle = 'hsl(' + (frames) + ',100%,' + (50 + (branch.depth / _tree.height) * 50) + '%';
            ctx.strokeStyle = 'hsl(' + ((60 * (branch.depth / _tree.height) + frames * 1.25)) + ',50%,' + (75 + 25 * -Math.sin(pi * frames / 360)) + '%';
            // ctx.strokeStyle = '#ddd';
            ctx.moveTo(point1.x, point1.y);
            ctx.lineTo(point2.x, point2.y);
            ctx.stroke();
            ctx.closePath();
            // ctx.fillStyle = 'hsl(' + ((360 * ((branch.depth - 1) / (_tree.height)))) + ',100%,50%';
            // ctx.lineWidth *= 2
            // ctx.arc(point2.x, point2.y, ctx.lineWidth, 0, 2 * pi)
            // ctx.fillRect(point2.x - ctx.lineWidth / 2, point2.y - ctx.lineWidth / 2, ctx.lineWidth, ctx.lineWidth);
            // ctx.fill();
            if (branch.depth > _tree.height) {
                ctx.globalAlpha = 0.075;
                // ctx.strokeStyle = 'hsl(' + (360 * (colors / Math.pow(2, _tree.height)) + frames) + ',100%,50%';
                // ctx.fillStyle = 'hsla(' + (360 * (colors / Math.pow(2, _tree.height)) + frames) + ',100%,50%,0.1';
                ctx.fillStyle = 'hsl(' + (360 * (colors / bulbs) + frames) + ',100%,' + (75 + 25 * Math.sin(pi * frames / 360)) + '%)';
                // ctx.lineWidth = 0.25
                var width = 12 * growth * growth;
                ctx.arc(point2.x, point2.y, width, 0, 2 * pi)
                    // ctx.strokeRect(point2.x - width / 2, point2.y - width / 2, width, width);
                    // ctx.stroke();
                ctx.fill();
                ctx.globalAlpha = 1;
                colors++;
            }
        }
        for (var m = 0; m < branch.branches.length; ++m) drawBranches(branch.branches[m]);
    }

    var growth = 0.05;
    var colors = 0;

    function draw() {
        // ctx.globalAlpha = 0.1;
        // ctx.fillStyle = "black";
        // ctx.fillRect(0, 0, cx * 2, cy * 2);
        ctx.clearRect(0, 0, cx * 2, cy * 2);
        // ctx.globalAlpha = 1;
        // drawFloor();
        if (growth < 1) growth += 0.002
        drawBranches(_tree.branches[0]);
        colors = 0;
        console.log(frames)
    }

    (function frame() {
        requestAnimationFrame(frame);
        frames++;
        doLogic();
        draw();
    })()
})